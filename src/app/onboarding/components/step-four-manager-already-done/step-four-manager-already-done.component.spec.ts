/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StepFourManagerAlreadyDoneComponent } from './step-four-manager-already-done.component';

describe('StepFourManagerAlreadyDoneComponent', () => {
  let component: StepFourManagerAlreadyDoneComponent;
  let fixture: ComponentFixture<StepFourManagerAlreadyDoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepFourManagerAlreadyDoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepFourManagerAlreadyDoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
