import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ManageInvitationService } from '../../manage-invitation.service';
import { DbInvitation } from '../../../db-invitation';

@Component({
  selector: 'app-confirm-overwrite',
  templateUrl: './confirm-overwrite.component.html',
  styleUrls: ['./confirm-overwrite.component.css']
})
export class ConfirmOverwriteComponent implements OnInit {

  modalRef: NgbModalRef;
  invitation: DbInvitation;

  constructor(
    private manageInvitationService: ManageInvitationService
  ) {
    console.log();
  }

  ngOnInit() {
    console.log();
  }

  confirmOverwrite() {
    this.manageInvitationService.updateInvitations([this.invitation]);
    this.modalRef.close();
  }

  noOverwrite() {
    this.invitation.phone = this.invitation.key;
    this.modalRef.close();
  }

}
