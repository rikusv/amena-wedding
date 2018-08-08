import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBaseComponent } from './manage-base.component';

describe('ManageBaseComponent', () => {
  let component: ManageBaseComponent;
  let fixture: ComponentFixture<ManageBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageBaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
