import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, Subject, from, Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, startWith } from 'rxjs/operators';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ConfirmOverwriteComponent } from './confirm-overwrite/confirm-overwrite.component';
import { EditInvitationComponent } from './edit-invitation/edit-invitation.component';
import { ConfirmSentComponent } from './confirm-sent/confirm-sent.component';
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
export class EditInvitationsComponent implements OnInit, OnDestroy {

  userSubscription: Subscription;
  eventsSubscription: Subscription;
  addSubScription: Subscription;
  invitations$: Observable<DbInvitation[]>;
  events$: Observable<Event[]>;
  events: Event[];
  rsvpEvents: Event[];
  eventLookup$: Observable<{[id: string]: Event}>;
  searchInput: string;
  sorter$: BehaviorSubject<{
    property: string, ascending: boolean
  }> = new BehaviorSubject(null);
  sortState = {};
  searchResult$: Observable<string[]>;
  numberOfResults: number;
  confirmOverwriteModal: NgbModalRef;
  confirmSentModal: NgbModalRef;
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
    private route: ActivatedRoute,
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
        ${value.name} ${value.phone} ${value.group} ${value.surname}
        ${value.wishlist ? 'wishlistOnly' : ''}
        ${value.unlikely ? 'unlikelyOnly' : ''}
        `;
      }),
      switchMap(input => {
        this.searchInput = input;
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
    this.userSubscription = this.authService.user$.subscribe(user => {
      if (user) {
        this.invitations$ = this.manageInvitationService.getInvitations$();
        this.events$ = this.manageEventService.getEvents$();
        this.eventsSubscription = this.events$.subscribe(events => {
          if (events) {
            this.events = events;
            this.rsvpEvents = this.manageEventService.rsvpEvents;
            this.updateNewInvitationForm(events);
            this.setNewInvitationFormValues();
          }
        });
        this.eventLookup$ = this.manageEventService.getEventLookup$();
      }
    });
    this.addSubScription = this.manageInvitationService.added$.subscribe(added => {
      if (added) {
        this.resetNewInvitationForm();
      }
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
    this.eventsSubscription.unsubscribe();
    this.addSubScription.unsubscribe();
  }

  onSort(property: string) {
    this.sortState[property] = this.sortState[property] ? !this.sortState[property] : true;
    this.sorter$.next({
      property: property,
      ascending: this.sortState[property]
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
      return this.rsvpEvents;
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

  setNewInvitationFormValues() {
    const data = this.route.snapshot.params;
    Object.keys(data).forEach(property => {
      this.newInvitationForm.get(property).setValue(
        data[property]
      );
    });
  }

  resetNewInvitationForm() {
    this.newInvitationForm.reset(this.initialNewInvitationFormValue);
  }

  getWhatsappMessage(invitation: DbInvitation) {
    return encodeURIComponent(
`Salaams ${invitation.name}. Greetings.

In the hope of saving some trees, we have decided to send you an invitation to \
Amena and Ferhat's wedding in digital form. We hope that you will accept this \
as a personal invitation.

Please take note of the RSVP button which you can click to send your RSVP.  We \
hope that you can join us!

Please feel free to message me on this number if you have any difficulty opening \
the link or require any assistance.

Please find your invitation by clicking here:
https://wedding.hayat.co.za/invitation/${invitation.key}

P.S. If I am not in your contact list, you may not see the link (the text in \
blue) - you can either add me to your list or just send a reply to this message \
and the link should activate.`
);
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

  onToggleInvitationSent(invitation: DbInvitation) {
    invitation.sent = !invitation.sent;
    this.manageInvitationService.updateInvitations([invitation]);
  }

  onConfirmInvitationSent(invitation: DbInvitation) {
    const modal = this.modalService.open(
      ConfirmSentComponent
    );
    const modalComponent = modal.componentInstance;
    modalComponent.invitation = invitation;
    modalComponent.modalRef = modal;
  }

  onSearch(input: string) {
  }

  onFileUpload(file: File) {
    this.manageInvitationService.uploadCsv(file);
  }

  onFileDownload(event: MouseEvent) {
    this.manageInvitationService.downloadCsv(event.target);
  }

}
