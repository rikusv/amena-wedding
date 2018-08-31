import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadInvitationsComponent } from './upload-invitations.component';

describe('UploadInvitationsComponent', () => {
  let component: UploadInvitationsComponent;
  let fixture: ComponentFixture<UploadInvitationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadInvitationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadInvitationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
