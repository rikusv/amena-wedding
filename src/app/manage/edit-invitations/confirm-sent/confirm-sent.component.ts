import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ManageInvitationService } from '../../manage-invitation.service';
import { DbInvitation } from '../../../db-invitation';

@Component({
  selector: 'app-confirm-sent',
  templateUrl: './confirm-sent.component.html',
  styleUrls: ['./confirm-sent.component.sass']
})
export class ConfirmSentComponent implements OnInit {

  modalRef: NgbModalRef;
  invitation: DbInvitation;

  constructor(
    private manageInvitationService: ManageInvitationService
  ) { }

  ngOnInit() {
  }

  confirmSent() {
    this.invitation.sent = true;
    this.manageInvitationService.updateInvitations([this.invitation]);
    this.modalRef.close();
  }

  notSent() {
    this.modalRef.close();
  }

}
