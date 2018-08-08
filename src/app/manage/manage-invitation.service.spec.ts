import { TestBed, inject } from '@angular/core/testing';

import { ManageInvitationService } from './manage-invitation.service';

describe('ManageInvitationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ManageInvitationService]
    });
  });

  it('should be created', inject([ManageInvitationService], (service: ManageInvitationService) => {
    expect(service).toBeTruthy();
  }));
});
