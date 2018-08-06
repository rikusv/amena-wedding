import { TestBed, inject } from '@angular/core/testing';

import { InvitationResolverService } from './invitation-resolver.service';

describe('InvitationResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InvitationResolverService]
    });
  });

  it('should be created', inject([InvitationResolverService], (service: InvitationResolverService) => {
    expect(service).toBeTruthy();
  }));
});
