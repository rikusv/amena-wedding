import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

import { Invitation } from '../invitation';
import { Event } from '../event';

@Injectable({
  providedIn: 'root'
})
export class ManageEventService {

  private eventCollection: AngularFirestoreCollection<Event>;
  private events$: BehaviorSubject<Event[] | null> = new BehaviorSubject(null);
  public eventLookup$: BehaviorSubject<{[id: string]: Event}> = new BehaviorSubject({});
  public eventLookup: {[id: string]: Event};
  public events: Event[];
  public rsvpEvents: Event[];
  private ready = false;

  constructor(
    private afs: AngularFirestore
  ) { }

  getEvents$(): Observable<Event[]> {
    if (!this.ready) {
      this.getEvents();
    }
    return this.events$;
  }

  getEventLookup$() {
    return this.eventLookup$;
  }

  getEvents() {
    this.eventCollection = this.afs.collection<Event>('events');
    this.eventCollection.snapshotChanges().pipe(
      map(actions => actions.map(action => ({
        id: action.payload.doc.id,
        ...action.payload.doc.data()
      })))
    ).subscribe(events => {
      this.rsvpEvents = events.filter(event => !event.public);
      this.events$.next(events);
      this.events = events;
      const eventLookup = {};
      events.forEach(event => {
        eventLookup[event.id] = event;
      });
      this.eventLookup = eventLookup;
      this.eventLookup$.next(eventLookup);
    });
  }

}
