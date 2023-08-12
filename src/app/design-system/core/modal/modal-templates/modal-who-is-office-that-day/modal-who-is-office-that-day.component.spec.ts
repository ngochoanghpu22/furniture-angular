/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ModalWhoIsOfficeThatDayComponent } from './modal-who-is-office-that-day.component';

describe('ModalWhoIsOfficeThatDayComponent', () => {
  let component: ModalWhoIsOfficeThatDayComponent;
  let fixture: ComponentFixture<ModalWhoIsOfficeThatDayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalWhoIsOfficeThatDayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalWhoIsOfficeThatDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
