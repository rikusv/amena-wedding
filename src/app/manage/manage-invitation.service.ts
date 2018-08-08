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
    // this.manageEventService.getEvents$();
    this.invitationCollection = this.afs.collection<DbInvitation>('invitations');
    this.invitationCollection.valueChanges().pipe(
      map(invitations => {
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
      updated += !invitation.delete ? 1 : 0;
      deleted += invitation.delete ? 1 : 0;
      const key = invitation.key;
      delete invitation.key;
      if ((key && key !== invitation.phone) || invitation.delete) {
        batch.delete(
          this.afs.firestore.collection('invitations').doc(key.toString())
        );
      }
      if (!key || key !== invitation.phone) {
        batch.set(
          this.afs.firestore.collection('invitations').doc(invitation.phone.toString()),
          invitation
        );
      } else if (!invitation.delete) {
        batch.update(
          this.afs.firestore.collection('invitations').doc(invitation.phone.toString()),
          invitation
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

}
