import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable, combineLatest, of, from, BehaviorSubject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import SearchApi from 'js-worker-search';
import { PapaParseService, PapaParseError } from 'ngx-papaparse';

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
  private invitations$: BehaviorSubject<DbInvitation[] | null> = new BehaviorSubject(null);
  public invitations: {[key: string]: DbInvitation} = {};
  public searchApi = new SearchApi();
  private ready = false;
  public numberOfInvitations: number;
  public added$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public invitationsForUpload: DbInvitation[] = [];
  public uploadErrors: PapaParseError[] = [];

  constructor(
    private router: Router,
    private afs: AngularFirestore,
    private manageEventService: ManageEventService,
    private messageService: MessageService,
    private papa: PapaParseService
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
      invitations.forEach(invitation => {
        this.invitations[invitation.key] = invitation;
      });
      this.invitations$.next(invitations);
    });
  }

  getInvitation$(key: string): Observable<DbInvitation> {
    if (this.invitations) {
      return of(this.invitations[key]);
    } else {
      return null;
    }
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

  downloadCsv(link: any) {
    const rows = [
      [
        'key',
        'phone',
        'group',
        'name',
        'surname',
        'unlikely',
        'wishlist',
        'sent'
      ],
      [
        'Unique identifier. Do not edit.',
        'E.g. \'27825555555\'',
        'Any group name',
        'Name invitation will be addressed to',
        'Family name',
        'true or blank',
        'true or blank',
        'true or blank'
      ]
    ];
    const events = this.manageEventService.rsvpEvents;
    events.forEach(event => {
      rows[0].push(`events ${event.id}`);
      rows[0].push(`rsvp ${event.id}`);
      rows[1].push(`Invited: ${event.name}`);
      rows[1].push(`RVSP: ${event.name}`);
    });
    Object.keys(this.invitations).forEach(key => {
      const row = [
        this.invitations[key].key.toString(),
        this.invitations[key].phone.toString(),
        this.invitations[key].group,
        this.invitations[key].name,
        this.invitations[key].surname,
        this.invitations[key].unlikely ? this.invitations[key].unlikely.toString() : '',
        this.invitations[key].wishlist ? this.invitations[key].wishlist.toString() : '',
        this.invitations[key].sent ? this.invitations[key].sent.toString() : ''
      ];
      events.forEach(event => {
        const invited = this.invitations[key].events && this.invitations[key].events[event.id] ?
        this.invitations[key].events[event.id].toString() || '' :
        '';
        const rsvp = this.invitations[key].rsvp && this.invitations[key].rsvp[event.id] ?
        this.invitations[key].rsvp[event.id].toString() || '' :
        '';
        row.push(invited);
        row.push(rsvp);
      });
      rows.push(row);
    });
    const csvContent = this.papa.unparse(rows);

    const blob = new Blob([csvContent], {type: 'data:text/csv'});
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.target = '_blank';
    link.download = 'rsvp.csv';
  }

  uploadCsv(file: File) {
    this.papa.parse(file, {
      header: true,
      complete: (result, _) => {
        this.invitationsForUpload = [];
        if (result.errors.length) {
          this.messageService.sendMessage({
            type: 'danger',
            text: 'Errors occurred!'
          });
          this.uploadErrors = result.errors;
        } else {
          this.uploadErrors = [];
        }
        const rows = result.data.slice(1);
        rows.forEach(row => {
          const invitation = new DbInvitation();
          invitation.events = {};
          invitation.rsvp = {};
          Object.keys(row).forEach(key => {
            const parts = key.split(' ');
            if (parts.length === 1) {
              let value;
              switch (key) {
                case 'key':
                  value = Number(row[key]);
                  break;
                case 'phone':
                  value = Number(row[key]);
                  break;
                case 'unlikely':
                  value = row[key] === 'true' ? true : false;
                  break;
                case 'wishlist':
                  value = row[key] === 'true' ? true : false;
                  break;
                case 'sent':
                  value = row[key] === 'true' ? true : false;
                  break;
                default:
                  value = row[key];
              }
              invitation[key] = value;
            } else {
              invitation[parts[0]][parts[1]] = row[key] > 0 ? Number(row[key]) : '';
            }
          });
          this.invitationsForUpload.push(invitation);
        });
        this.router.navigate(['/manage/upload']);
      }
    });
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
