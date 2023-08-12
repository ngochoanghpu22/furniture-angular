/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { StepFiveComponent } from './step-five.component';

describe('StepFiveComponent', () => {
  let component: StepFiveComponent;
  let fixture: ComponentFixture<StepFiveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepFiveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepFiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
