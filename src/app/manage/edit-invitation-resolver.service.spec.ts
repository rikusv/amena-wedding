import { TestBed, inject } from '@angular/core/testing';

import { EditInvitationResolverService } from './edit-invitation-resolver.service';

describe('EditInvitationResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EditInvitationResolverService]
    });
  });

  it('should be created', inject([EditInvitationResolverService], (service: EditInvitationResolverService) => {
    expect(service).toBeTruthy();
  }));
});
