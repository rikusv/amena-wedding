import { Component, OnInit } from '@angular/core';

import { ManageInvitationService } from '../manage-invitation.service';
import { ManageEventService } from '../manage-event.service';
import { DbInvitation } from '../../db-invitation';
import { Event } from '../../event';

@Component({
  selector: 'app-upload-invitations',
  templateUrl: './upload-invitations.component.html',
  styleUrls: ['./upload-invitations.component.sass']
})
export class UploadInvitationsComponent implements OnInit {

  rsvpEvents: Event[];
  invitations: DbInvitation[];
  errors: any[];

  constructor(
    private manageEventService: ManageEventService,
    private manageInvitationService: ManageInvitationService
  ) { }

  ngOnInit() {
    this.rsvpEvents = this.manageEventService.rsvpEvents;
    this.invitations = this.manageInvitationService.invitationsForUpload;
    this.errors = this.manageInvitationService.uploadErrors;
  }

  onOverwriteInvitations() {
    this.manageInvitationService.updateInvitations(this.invitations);
  }

}
