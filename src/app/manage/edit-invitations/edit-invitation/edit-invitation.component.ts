import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ConfirmOverwriteComponent } from '../confirm-overwrite/confirm-overwrite.component';
import { ManageInvitationService } from '../../manage-invitation.service';
import { ManageEventService } from '../../manage-event.service';
import { DbInvitation } from '../../../db-invitation';
import { Event } from '../../../event';

@Component({
  selector: 'app-edit-invitation',
  templateUrl: './edit-invitation.component.html',
  styleUrls: ['./edit-invitation.component.sass']
})
export class EditInvitationComponent implements OnInit {

  modalRef: NgbModalRef;
  invitation: DbInvitation;
  rsvpEvents: Event[];
  changeInvitationForm: FormGroup;
  initialFormValue: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private manageInvitationService: ManageInvitationService,
    private manageEventService: ManageEventService,
    private modalService: NgbModal,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.createForm();
    this.route.data
    .subscribe((data: { invitation: DbInvitation }) => {
      this.invitation = data.invitation;
      this.rsvpEvents = this.manageEventService.rsvpEvents;
      this.updateForm();
    });
  }

  get sent() { return this.changeInvitationForm.get('sent'); }

  createForm() {
    this.changeInvitationForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern]],
      name: ['', Validators.required],
      surname: [''],
      group: [''],
      wishlist: [''],
      unlikely: [''],
      sent: ['']
    });
    this.initialFormValue = this.changeInvitationForm.getRawValue();
  }

  updateForm() {
    const invitation = {
      phone: this.invitation.phone,
      name: this.invitation.name,
      surname: this.invitation.surname,
      group: this.invitation.group,
      unlikely: this.invitation.unlikely || false,
      wishlist: this.invitation.wishlist || false,
      sent: this.invitation.sent || false
    };
    const events = {};
    const rsvp = {};
    Object.keys(this.rsvpEvents).forEach(key => {
      const eventId = this.rsvpEvents[key].id;
      events[eventId] = this.invitation.events[eventId] || '';
      rsvp[eventId] = this.invitation.rsvp[eventId] || '';
      rsvp[eventId] = typeof this.invitation.rsvp[eventId] === 'undefined' ?
      '' : this.invitation.rsvp[eventId];
    });
    this.changeInvitationForm.setValue(invitation);
    this.changeInvitationForm.controls.events = this.fb.group(events);
    this.changeInvitationForm.controls.rsvp = this.fb.group(rsvp);
  }

  eventsOnceFormReady() {
    if (this.changeInvitationForm.get('events') &&
    Object.keys(this.changeInvitationForm.get('events').value).length) {
      return this.rsvpEvents;
    }
  }

  onCancel() {
    this.navigateBack();
  }

  onChange() {
    const invitation = this.changeInvitationForm.getRawValue();
    invitation.key = this.invitation.key;
    if (invitation.key !== invitation.phone) {
      this.manageInvitationService.searchApi.search(invitation.phone)
      .then(results => {
        if (results.indexOf(invitation.phone) !== -1) {
          const modal = this.modalService.open(
            ConfirmOverwriteComponent,
            {
              backdrop: 'static',
              keyboard: false
            }
          );
          const modalComponent = modal.componentInstance;
          modalComponent.invitation = invitation;
          modalComponent.modalRef = modal;
        } else {
          this.manageInvitationService.updateInvitations([invitation]);
        }
      });
    } else {
      this.manageInvitationService.updateInvitations([invitation]);
    }
    this.navigateBack();
  }

  onDelete() {
    const invitation = this.invitation;
    invitation.delete = true;
    this.manageInvitationService.updateInvitations([invitation]);
    this.navigateBack();
  }

  navigateBack() {
    this.changeInvitationForm.reset(this.initialFormValue);
    this.router.navigate(['/manage']);
  }

}
