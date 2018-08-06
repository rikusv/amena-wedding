export class Event {

  constructor(
    id: string,
    event: any,
    max: number,
    rsvp: number | null
  ) {
    this.id = id;
    this.max = max;
    Object.keys(event).map(key => this[key] = event[key]);
  }

  id: string;
  name: string;
  time: string;
  venue: string;
  max?: number;
  rsvp?: number | null;
}
