export class DbInvitation {

  constructor(dbInvitation: any) {
    this.name = dbInvitation.name;
    this.events = dbInvitation.events;
    this.rsvp = dbInvitation.rsvp;
  }

  name: string;
  events: {
    [id: string]: number
  };
  rsvp: {
    [id: string]: number
  };
}
