import { Component, OnInit } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, startWith } from 'rxjs/operators';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ConfirmOverwriteComponent } from './confirm-overwrite/confirm-overwrite.component';
import { AuthService } from '../auth.service';
import { ManageInvitationService } from '../manage-invitation.service';
import { ManageEventService } from '../manage-event.service';
import { MessageService } from '../../message.service';
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
  eventLookup$: Observable<{[id: string]: Event}>;
  search$: Subject<string> = new Subject();
  searchResult$: Observable<string[]>;
  new: DbInvitation = new DbInvitation();
  confirmOverwriteModal: NgbModalRef;

  constructor(
    public authService: AuthService,
    private manageInvitationService: ManageInvitationService,
    private manageEventService: ManageEventService,
    public messageService: MessageService,
    private modalService: NgbModal
  ) {
    this.searchResult$ = this.search$.pipe(
      startWith(''),
      distinctUntilChanged(),
      debounceTime(500),
      switchMap(input => {
        return from(
          this.manageInvitationService.searchApi.search(input)
        ).pipe(
          map(results => {
            return Object.keys(results).map(key => {
              return results[key];
            });
          })
        );
      })
    );
  }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.manageInvitationService.getInvitations();
        this.invitations$ = this.manageInvitationService.getInvitations$();
        this.events$ = this.manageEventService.getEvents$();
        this.events$.subscribe(events => this.events = events);
        this.eventLookup$ = this.manageEventService.getEventLookup$();
      }
    });
  }

  onChange(invitation: DbInvitation) {
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
  }

  onAdd(invitation: DbInvitation) {
    this.manageInvitationService.updateInvitations([invitation])
    .subscribe(success => {
      if (success) {
        this.new = new DbInvitation();
        this.search$.next('');
      }
    });
  }

  onDelete(invitation: DbInvitation) {
    invitation.delete = true;
    this.manageInvitationService.updateInvitations([invitation]);
  }

  onSearch(input: string) {
    this.search$.next(input);
  }

}
