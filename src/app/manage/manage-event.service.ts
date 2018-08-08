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
  private events$: Observable<Event[]>;
  public eventLookup$: BehaviorSubject<{[id: string]: Event}> = new BehaviorSubject({});
  public eventLookup: {[id: string]: Event};
  public events: Event[];

  constructor(
    private afs: AngularFirestore
  ) { }

  getEvents$(): Observable<Event[]> {
    return this.events$;
  }

  getEventLookup$() {
    return this.eventLookup$;
  }

  getEvents() {
    this.eventCollection = this.afs.collection<Event>('events');
    this.events$ = this.eventCollection.snapshotChanges().pipe(
      map(actions => actions.map(action => ({
        id: action.payload.doc.id,
        ...action.payload.doc.data()
      })))
    );
    this.events$.subscribe(events => {
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
