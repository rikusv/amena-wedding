import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmSentComponent } from './confirm-sent.component';

describe('ConfirmSentComponent', () => {
  let component: ConfirmSentComponent;
  let fixture: ComponentFixture<ConfirmSentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmSentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmSentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
