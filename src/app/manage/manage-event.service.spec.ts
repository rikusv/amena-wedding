import { TestBed, inject } from '@angular/core/testing';

import { ManageEventService } from './manage-event.service';

describe('ManageEventService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ManageEventService]
    });
  });

  it('should be created', inject([ManageEventService], (service: ManageEventService) => {
    expect(service).toBeTruthy();
  }));
});
