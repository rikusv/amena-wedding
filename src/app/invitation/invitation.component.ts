import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';

import { InvitationService } from '../invitation.service';
import { Invitation } from '../invitation';
import { Event } from '../event';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.css']
})
export class InvitationComponent implements OnInit {

  invitation$: Observable<Invitation>;
  invitation: Invitation;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private invitationService: InvitationService
  ) {}

  ngOnInit() {
    this.route.data
    .subscribe((data: {invitation: Invitation}) => {
      this.invitation = data.invitation;
      this.invitation$ = this.invitationService.getInvitation$();
    });
  }

  numbers(to: number): number[] {
    return Array(to + 1).fill('').map((empty, i) => i);
  }

  rsvp(event: Event, n: number) {
    this.invitationService.rsvp(this.invitation.phone, event.id, n);
  }

}
