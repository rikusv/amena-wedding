import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, Subject, from } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, startWith } from 'rxjs/operators';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ConfirmOverwriteComponent } from './confirm-overwrite/confirm-overwrite.component';
import { EditInvitationComponent } from './edit-invitation/edit-invitation.component';
import { AuthService } from '../auth.service';
import { ManageInvitationService } from '../manage-invitation.service';
import { ManageEventService } from '../manage-event.service';
import { DbInvitation } from '../../db-invitation';
import { Event } from '../../event';

@Component({
  selector: 'app-edit-invitations',
  templateUrl: './edit-invitations.component.html',
  styleUrls: ['./edit-invitations.component.css']
})
export class EditInvitationsComponent implements OnInit {

  invitations$: Observable<DbInvitation[]>;
  events$: Observable<Event[]>;
  events: Event[];
  rsvpEvents: Event[];
  eventLookup$: Observable<{[id: string]: Event}>;
  searchResult$: Observable<string[]>;
  numberOfResults: number;
  confirmOverwriteModal: NgbModalRef;
  newInvitationForm = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern]],
    name: ['', Validators.required],
    surname: [''],
    group: [''],
    wishlist: [false],
    unlikely: [false]
  });
  initialNewInvitationFormValue: DbInvitation = this.newInvitationForm.value;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private manageInvitationService: ManageInvitationService,
    private manageEventService: ManageEventService,
    private modalService: NgbModal
  ) {
    this.searchResult$ = this.newInvitationForm.valueChanges.pipe(
      debounceTime(500),
      map((value: DbInvitation) => {
        return `
        ${value.name} ${value.phone} ${value.group}
        ${value.wishlist ? 'wishlistOnly' : ''}
        ${value.unlikely ? 'unlikelyOnly' : ''}
        `;
      }),
      switchMap(input => {
        return from(
          this.manageInvitationService.searchApi.search(input)
        ).pipe(
          map((results: string[]) => {
            this.numberOfResults = results.length === this.manageInvitationService.numberOfInvitations ?
            0 : results.length;
            return results;
          })
        );
      })
    );
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.invitations$ = this.manageInvitationService.getInvitations$();
        this.events$ = this.manageEventService.getEvents$();
        this.events$.subscribe(events => {
          if (events) {
            this.events = events;
            this.rsvpEvents = events.filter(event => !event.public);
            this.updateNewInvitationForm(events);
          }
        });
        this.eventLookup$ = this.manageEventService.getEventLookup$();
      }
    });
    this.manageInvitationService.added$.subscribe(added => {
      if (added) {
        this.resetNewInvitationForm();
      }
    });
  }

  objectKeys(object: {}) {
    if (object) {
      return Object.keys(object);
    } else {
      return null;
    }
  }

  eventsOnceFormReady() {
    if (this.newInvitationForm.get('events') &&
    Object.keys(this.newInvitationForm.get('events').value).length) {
      return this.events;
    }
  }

  get phone() { return this.newInvitationForm.get('phone'); }
  get name() { return this.newInvitationForm.get('name'); }

  updateNewInvitationForm(events: Event[]) {
    const eventMap = {};
    events.forEach(event => {
      if (!event.public) {
        eventMap[event.id] = '';
      }
    });
    this.newInvitationForm.controls.events = this.fb.group(eventMap);
    this.newInvitationForm.controls.rsvp = this.fb.group(eventMap);
    this.initialNewInvitationFormValue = this.newInvitationForm.value;
  }

  resetNewInvitationForm() {
    this.newInvitationForm.reset(this.initialNewInvitationFormValue);
  }

  onInvitationPress(invitation: DbInvitation) {
    const modal = this.modalService.open(
      EditInvitationComponent
    );
    const modalComponent = modal.componentInstance;
    modalComponent.modalRef = modal;
    modalComponent.invitation = invitation;
    modalComponent.rsvpEvents = this.rsvpEvents;
  }

  onAdd() {
    const invitation = this.newInvitationForm.getRawValue();
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
  }

  onSearch(input: string) {
  }

}
