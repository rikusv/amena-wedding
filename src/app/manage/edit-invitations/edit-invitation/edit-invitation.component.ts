import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ConfirmOverwriteComponent } from '../confirm-overwrite/confirm-overwrite.component';
import { ManageInvitationService } from '../../manage-invitation.service';
import { DbInvitation } from '../../../db-invitation';
import { Event } from '../../../event';

@Component({
  selector: 'app-edit-invitation',
  templateUrl: './edit-invitation.component.html',
  styleUrls: ['./edit-invitation.component.sass']
})
export class EditInvitationComponent implements OnInit {

  modalRef: NgbModalRef;
  invitation: DbInvitation;
  invitationBefore: DbInvitation;
  rsvpEvents: Event[];

  constructor(
    private manageInvitationService: ManageInvitationService,
    private modalService: NgbModal
  ) { }

  ngOnInit() {
    this.invitation = new DbInvitation();
    Object.assign(this.invitation, this.invitationBefore);
  }

  onCancel() {
    this.modalRef.close();
  }

  onChange() {
    const invitation = this.invitation;
    if (invitation.key !== invitation.phone) {
      this.manageInvitationService.searchApi.search(invitation.phone)
      .then(results => {
        if (results.indexOf(invitation.phone) !== -1) {
          const modal = this.modalService.open(
            ConfirmOverwriteComponent,
            {
              backdrop: 'static',
              keyboard: false
            }
          );
          const modalComponent = modal.componentInstance;
          modalComponent.invitation = invitation;
          modalComponent.modalRef = modal;
        } else {
          this.manageInvitationService.updateInvitations([invitation]);
        }
      });
    } else {
      this.manageInvitationService.updateInvitations([invitation]);
    }
    this.modalRef.close();
  }

  onDelete() {
    const invitation = this.invitation;
    invitation.delete = true;
    this.manageInvitationService.updateInvitations([invitation]);
    this.modalRef.close();
  }

}
