import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TranslocoRootModule } from '@design-system/core';
import { DesignSystemModule } from '../design-system';
import {
  StepFiveComponent,
  StepFourFavoriteAlreadyDoneComponent,
  StepFourFavoriteComponent,
  StepFourManagerComponent,
  StepFourManagerAlreadyDoneComponent,
  StepOneComponent,
  StepThreeComponent,
  StepTwoComponent,
  FirstStepComponent,
  SecondStepComponent
} from './components';
import { OnboardingComponent } from './onboarding.component';

const routes: Routes = [
  {
    path: '',
    component: OnboardingComponent
  }
];

const components = [
  OnboardingComponent,
  StepOneComponent,
  StepTwoComponent,
  StepThreeComponent,
  StepFourFavoriteAlreadyDoneComponent,
  StepFourFavoriteComponent,
  StepFiveComponent,
  StepFourManagerComponent,
  StepFourManagerAlreadyDoneComponent,

  FirstStepComponent,
  SecondStepComponent
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DesignSystemModule,
    FormsModule,
    RouterModule.forChild(routes),
    TranslocoRootModule
  ],
  declarations: [
    ...components
  ]
})
export class OnboardingModule { }
