export class Event {

  id: string;
  name: string;
  public: boolean;
  time: string;
  venue: string;
  max?: number;
  rsvp?: number | null;
}
