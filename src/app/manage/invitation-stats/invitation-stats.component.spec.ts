import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationStatsComponent } from './invitation-stats.component';

describe('InvitationStatsComponent', () => {
  let component: InvitationStatsComponent;
  let fixture: ComponentFixture<InvitationStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvitationStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvitationStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
