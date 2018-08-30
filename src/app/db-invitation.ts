export class DbInvitation {

  constructor() {
    this.events = {};
    this.rsvp = {};
  }

  key?: number;
  phone: number;
  name: string;
  surname?: string;
  group: string;
  wishlist: boolean;
  unlikely: boolean;
  events: {
    [id: string]: number
  };
  rsvp: {
    [id: string]: number
  };
  sent: boolean;
  delete?: boolean;
}
