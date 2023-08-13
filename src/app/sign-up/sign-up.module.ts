import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SignUpComponent } from './sign-up.component';
import { SignInService } from '../sign-in/sign-in.service';

const routes: Routes = [
  {
    path: '',
    component: SignUpComponent
  }
];

// const services: any[] = [
//   SignInService
// ]


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SignUpComponent],
  // providers: [
  //   ...services
  // ]
})
export class SignUpModule { }
