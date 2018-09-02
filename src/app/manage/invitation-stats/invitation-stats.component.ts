import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from '../auth.service';
import { ManageInvitationService } from '../manage-invitation.service';

@Component({
  selector: 'app-invitation-stats',
  templateUrl: './invitation-stats.component.html',
  styleUrls: ['./invitation-stats.component.css']
})
export class InvitationStatsComponent implements OnInit {

  stats$: Observable<any>;

  constructor(
    public authService: AuthService,
    private manageInvitationService: ManageInvitationService
  ) { }

  ngOnInit() {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.stats$ = this.manageInvitationService.getInvitationStats();
        // this.invitations$ = this.manageInvitationService.getInvitations$();
        // this.events$ = this.manageEventService.getEvents$();
        // this.events$.subscribe(events => {
        //   this.events = events;
        //   this.updateNewInvitationForm(events);
        // });
        // this.eventLookup$ = this.manageEventService.getEventLookup$();
      }
    });
  }

  objectKeys(object: {}) {
    if (object) {
      return Object.keys(object);
    } else {
      return null;
    }
  }

  notComing(record: any) {
    return record.invited - record.rsvp - record.pending;
  }

}
