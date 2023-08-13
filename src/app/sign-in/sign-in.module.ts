import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './sign-in.component';
import { SignInService } from './sign-in.service';
import { ProfileService } from '../profile/profile.service';

const routes: Routes = [
  {
    path: '',
    component: SignInComponent
  }
];

const services = [
  SignInService,
  ProfileService
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SignInComponent],
  providers: [...services],
  exports: [SignInComponent],
})
export class SignInModule { }
