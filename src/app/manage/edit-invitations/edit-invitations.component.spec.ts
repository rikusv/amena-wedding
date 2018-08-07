import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditInvitationsComponent } from './edit-invitations.component';

describe('EditInvitationsComponent', () => {
  let component: EditInvitationsComponent;
  let fixture: ComponentFixture<EditInvitationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditInvitationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditInvitationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
