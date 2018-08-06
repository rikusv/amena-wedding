import { Event } from './event';

export class Invitation {

  constructor(invitation: any) {
    this.name = invitation.name;
    this.events = [];
  }

  name: string;
  phone: number;
  events: Event[];
}
