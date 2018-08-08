import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmOverwriteComponent } from './confirm-overwrite.component';

describe('ConfirmOverwriteComponent', () => {
  let component: ConfirmOverwriteComponent;
  let fixture: ComponentFixture<ConfirmOverwriteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmOverwriteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmOverwriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
