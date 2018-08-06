import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable, combineLatest, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Invitation } from './invitation';
import { DbInvitation } from './db-invitation';
import { Event } from './event';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {

  private invitationDoc: AngularFirestoreDocument<DbInvitation>;
  private invitation$: Observable<Invitation>;
  private dbInvitation: DbInvitation;

  constructor(
    private afs: AngularFirestore
  ) { }

  getInvitation$() {
    return this.invitation$;
  }

  getInvitation(phone: number): Observable<Invitation> {
    this.invitationDoc = this.afs.doc<DbInvitation>(`invitations/${phone}`);
    this.invitation$ = this.invitationDoc.valueChanges().pipe(
      switchMap(dbInvitationSnapshot => {
        if (!dbInvitationSnapshot) {
          return of(null);
        }
        this.dbInvitation = dbInvitationSnapshot;
        const eventObservables = Object.keys(this.dbInvitation.events).map(key => {
          return this.afs.doc<Event>(`events/${key}`).snapshotChanges();
        });
        return combineLatest(eventObservables).pipe(
          switchMap(eventSnapshots => {
            return of({
                name: this.dbInvitation.name,
                phone: phone,
                events: eventSnapshots.map(eventSnapshot => {
                  const event = {
                    id: eventSnapshot.payload.id,
                    max: this.dbInvitation.events[eventSnapshot.payload.id],
                    rsvp: this.dbInvitation.rsvp ? this.dbInvitation.rsvp[eventSnapshot.payload.id] : null,
                    ...eventSnapshot.payload.data()
                  };
                  return event;
                })
              });
          })
        );
      })
    );
    return this.invitation$;
  }

  rsvp(phone: number, eventId: string, n: number) {
    const change = {rsvp: this.dbInvitation.rsvp};
    change.rsvp[eventId] = n;
    this.afs.doc<DbInvitation>(`invitations/${phone}`).update(change)
    .catch(error => {
      console.log(error);
    });
  }
}
