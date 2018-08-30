// TODO: change to reactive form

import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { ConfirmOverwriteComponent } from '../confirm-overwrite/confirm-overwrite.component';
import { ManageInvitationService } from '../../manage-invitation.service';
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
  // invitationBefore: DbInvitation;
  rsvpEvents: Event[];
  changeInvitationForm: FormGroup;

  constructor(
    private manageInvitationService: ManageInvitationService,
    private modalService: NgbModal,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    // this.copyObjectValues(this.invitationBefore, this.invitation);
    this.createForm();
  }

  createForm() {
    const events = {};
    const rsvp = {};
    Object.keys(this.rsvpEvents).forEach(key => {
      events[this.rsvpEvents[key].id] = this.invitation.events[key] || '';
      rsvp[this.rsvpEvents[key].id] = this.invitation.rsvp[key] || '';
    });
    this.changeInvitationForm = this.fb.group({
      phone: [this.invitation.phone, [Validators.required, Validators.pattern]],
      name: [this.invitation.name, Validators.required],
      surname: [this.invitation.surname],
      group: [this.invitation.group],
      wishlist: [this.invitation.wishlist],
      unlikely: [this.invitation.unlikely],
      events: this.fb.group(events),
      rsvp: this.fb.group(rsvp)
    });
  }

  // copyObjectValues(from: object, to: object) {
  //   Object.keys(from).forEach(key => {
  //     if (typeof from[key] === 'object') {
  //       to[key] = {};
  //       this.copyObjectValues(from[key], to[key]);
  //     } else {
  //       to[key] = from[key];
  //     }
  //   });
  // }

  onCancel() {
    this.modalRef.close();
  }

  onChange() {
    const invitation = this.changeInvitationForm.getRawValue();
    if (this.invitation.key !== invitation.phone) {
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
    this.modalRef.close();
  }

  onDelete() {
    const invitation = this.invitation;
    invitation.delete = true;
    this.manageInvitationService.updateInvitations([invitation]);
    this.modalRef.close();
  }

}
