import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable, combineLatest, of, from, BehaviorSubject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import SearchApi from 'js-worker-search';

import { ManageEventService } from './manage-event.service';
import { MessageService } from '../message.service';

import { Invitation } from '../invitation';
import { DbInvitation } from '../db-invitation';
import { Event } from '../event';

@Injectable({
  providedIn: 'root'
})
export class ManageInvitationService {

  private invitationCollection: AngularFirestoreCollection<DbInvitation>;
  // private invitations$: Observable<DbInvitation[]>;
  private invitations$: BehaviorSubject<DbInvitation[] | null> = new BehaviorSubject(null);
  public searchApi = new SearchApi();
  private ready = false;
  public numberOfInvitations: number;

  constructor(
    private afs: AngularFirestore,
    private manageEventService: ManageEventService,
    private messageService: MessageService
  ) { }

  getInvitations$(): Observable<DbInvitation[]> {
    if (!this.ready) {
      this.getInvitations();
    }
    return this.invitations$;
  }

  getInvitations() {
    this.ready = true;
    this.invitationCollection = this.afs.collection<DbInvitation>('invitations');
    this.invitationCollection.valueChanges().pipe(
      map(invitations => {
        this.numberOfInvitations = invitations.length;
        if (this.searchApi) {
          this.searchApi.terminate();
        }
        this.searchApi = new SearchApi();
        return invitations.map(invitation => {
          this.searchApi.indexDocument(
            invitation.phone,
            `
            ${invitation.name}
            ${invitation.phone}
            ${invitation.group}
            ${invitation.wishlist ? 'wishlistOnly' : ''}
            ${invitation.unlikely ? 'unlikelyOnly' : ''}
            `
          );
          return {
            key: invitation.phone,
            ...invitation
          };
        });
      })
    ).subscribe(invitations => {
     this.invitations$.next(invitations);
    });
  }

  updateInvitations(invitations: DbInvitation[]): Observable<boolean> {
    const batch = this.afs.firestore.batch();
    let updated = 0, deleted = 0;
    invitations.forEach(invitation => {
      const payload = {rsvp: {}, events: {}};
      Object.keys(invitation).forEach(property => {
        if (property !== 'key' && property !== 'events' && property !== 'rsvp') {
          payload[property] = invitation[property];
        }
      });
      Object.keys(invitation.events).forEach(event => {
        if (invitation.events[event] > 0) {
          payload.events[event] = invitation.events[event];
        }
      });
      Object.keys(invitation.rsvp).forEach(rsvp => {
        if (invitation.rsvp[rsvp] > 0) {
          payload.rsvp[rsvp] = invitation.rsvp[rsvp];
        }
      });
      updated += !invitation.delete ? 1 : 0;
      deleted += invitation.delete ? 1 : 0;
      const key = invitation.key;
      if ((key && key !== invitation.phone) || invitation.delete) {
        batch.delete(
          this.afs.firestore.collection('invitations').doc(key.toString())
        );
      }
      if (!key || key !== invitation.phone) {
        batch.set(
          this.afs.firestore.collection('invitations').doc(invitation.phone.toString()),
          payload
        );
      } else if (!invitation.delete) {
        batch.update(
          this.afs.firestore.collection('invitations').doc(invitation.phone.toString()),
          payload
        );
      }
    });
    return from(batch.commit()
    .then(() => {
      if (updated > 0) {
        this.messageService.sendMessage({
          type: 'success',
          text: `${updated} ${updated > 1 ? 'invitations' : 'invitation'} updated`
        });
      }
      if (deleted > 0) {
        this.messageService.sendMessage({
          type: 'warning',
          text: `${deleted} ${deleted > 1 ? 'invitations' : 'invitation'} deleted`
        });
      }
      return true;
    })
    .catch(error => {
      this.messageService.sendMessage({
        type: 'danger',
        text: `
        Could not update ${invitations.length} ${invitations.length > 1 ? 'invitations' : 'invitation'}!
        `
      });
      return false;
    }));
  }

  getInvitationStats(): Observable<any> {
    if (!this.ready) {
      this.getInvitations();
    }
    const combined$ = combineLatest([
      this.invitations$,
      this.manageEventService.getEvents$()
    ]).pipe(
      map(arrays => {
        const invitations = arrays[0] as any[];
        const events = arrays[1] as any[];
        const data: any = {};
        if (!invitations || !events) {
          return data;
        }
        events.forEach(event => {
          if (!event.public) {
            data[event.id] = {
              name: this.manageEventService.eventLookup ?
              this.manageEventService.eventLookup[event.id].name : event.id,
              invited: 0,
              rsvp: 0,
              pending: 0,
              group: {},
              unlikely: {
                invited: 0,
                rsvp: 0,
                pending: 0
              },
              wishlist: {
                invited: 0,
                rsvp: 0,
                pending: 0
              }
            };
          }
        });
        invitations.forEach(invitation => {
          Object.keys(invitation.events).forEach(eventId => {
            if (invitation.wishlist) {
              data[eventId].wishlist.invited += invitation.wishlist ? invitation.events[eventId] || 0 : 0;
              data[eventId].wishlist.rsvp += invitation.wishlist ? invitation.rsvp[eventId] || 0 : 0;
              data[eventId].wishlist.pending += invitation.wishlist ?
              (typeof invitation.rsvp[eventId] !== 'number' ? invitation.events[eventId] : 0) : 0;
            } else {
              data[eventId].invited += invitation.events[eventId] || 0;
              data[eventId].rsvp += invitation.rsvp[eventId] || 0;
              data[eventId].pending += typeof invitation.rsvp[eventId] !== 'number' ? invitation.events[eventId] : 0;
              data[eventId].unlikely.invited += invitation.unlikely ? invitation.events[eventId] || 0 : 0;
              data[eventId].unlikely.rsvp += invitation.unlikely ? invitation.rsvp[eventId] || 0 : 0;
              data[eventId].unlikely.pending += invitation.unlikely ? (typeof invitation.rsvp[eventId] !== 'number' ?
                invitation.events[eventId] : 0) : 0;
              if (!data[eventId].group[invitation.group]) {
                data[eventId].group[invitation.group] = {
                  invited: 0,
                  rsvp: 0,
                  pending: 0
                };
              }
              data[eventId].group[invitation.group].invited += invitation.events[eventId] || 0;
              data[eventId].group[invitation.group].rsvp += invitation.rsvp[eventId] || 0;
              data[eventId].group[invitation.group].pending += typeof invitation.rsvp[eventId] !== 'number' ?
              invitation.events[eventId] : 0;
            }
          });
        });
        return data;
      })
    );
    combined$.subscribe();
    return combined$;
  }

}
