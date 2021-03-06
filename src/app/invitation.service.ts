import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable, combineLatest, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

import { Invitation } from './invitation';
import { DbInvitation } from './db-invitation';
import { Event } from './event';

@Injectable({
  providedIn: 'root'
})
export class InvitationService {

  private publicEventsCollection: AngularFirestoreCollection<Event>;
  private publicEvents$: Observable<Event[]>;
  private invitationDoc: AngularFirestoreDocument<DbInvitation>;
  private invitation$: Observable<Invitation>;
  private dbInvitation: DbInvitation;

  constructor(
    private afs: AngularFirestore
  ) {
    this.publicEventsCollection = this.afs.collection('events', ref => ref.where('public', '==', true));
    this.publicEvents$ = this.publicEventsCollection.valueChanges();
    this.publicEvents$.subscribe();
  }

  getInvitation$(): Observable<Invitation> {
    return this.invitation$;
  }

  getInvitation(phone: number): Observable<Invitation> {
    function sortEvents(invitation) {
      invitation.events.sort((a, b) => {
        return a.datetime.seconds - b.datetime.seconds;
      });
      return invitation;
    }
    this.invitationDoc = this.afs.doc<DbInvitation>(`invitations/${phone}`);
    this.invitation$ = combineLatest(this.invitationDoc.valueChanges(), this.publicEventsCollection.valueChanges()).pipe(
      catchError(error => of(error)),
      switchMap(([dbInvitation, publicEvents]) => {
        if (!dbInvitation || dbInvitation instanceof Error) {
          return of(null);
        }
        const invitationEvents = publicEvents.map(event => event);
        this.dbInvitation = dbInvitation;
        const invitation = {
          name: this.dbInvitation.name,
          phone: phone,
          events: invitationEvents
        };
        if (dbInvitation.events && Object.keys(dbInvitation.events).length) {
          const eventObservables = Object.keys(this.dbInvitation.events).map(key => {
            return this.afs.doc<Event>(`events/${key}`).snapshotChanges();
          });
          return combineLatest(eventObservables).pipe(
            switchMap(eventSnapshots => {
              eventSnapshots.forEach(eventSnapshot => {
                invitationEvents.push({
                  id: eventSnapshot.payload.id,
                  max: this.dbInvitation.events[eventSnapshot.payload.id],
                  rsvp: this.dbInvitation.rsvp ? this.dbInvitation.rsvp[eventSnapshot.payload.id] : null,
                  ...eventSnapshot.payload.data()
                });
              });
              invitation.events = invitationEvents;
              return of(sortEvents(invitation));
            })
          );
        } else {
          return of (sortEvents(invitation));
        }
      })
    );
    return this.invitation$;
  }

  rsvp(phone: number, eventId: string, n: number) {
    const change = {rsvp: this.dbInvitation.rsvp || {}};
    change.rsvp[eventId] = n;
    this.afs.doc<DbInvitation>(`invitations/${phone}`).update(change)
    .catch(error => {
      console.log(error);
    });
  }

}
