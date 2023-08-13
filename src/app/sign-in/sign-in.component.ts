import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SignInService } from './sign-in.service';
import { ToastrService } from 'ngx-toastr';

import { Observable, Subject } from 'rxjs';
import { ProfileService } from '../profile/profile.service';
import { Router } from '@angular/router';
import { REGEX_PATTERN } from '../core/regex/regex';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  providers: [ProfileService]
})
export class SignInComponent {
  signInForm: FormGroup = new FormGroup({});;

  constructor(
    private formBuilder: FormBuilder,
    private signInService: SignInService,
    private toastr: ToastrService,
    private profileService: ProfileService,
    protected router: Router
  ) {
    this.initSignInForm();
  }

  initSignInForm() {
    this.signInForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(REGEX_PATTERN.EMAIL)]],
      password: ['', [Validators.required]]
    });
  }

  signIn() {
    let userDto: any = {};
    userDto.email = this.signInForm.controls['email'].value;
    userDto.password = this.signInForm.controls['password'].value;
    

    this.signInService
      .signIn(userDto)
      .subscribe(
        (data: any) => {
          if (data.isSuccessed) {
            this.profileService.setProfile(data.resultObj);
            localStorage.setItem('profile', JSON.stringify(data.resultObj));
            this.router.navigate(['/profile']);

            this.toastr.success("Login successfully.");
          }
          else {
            this.toastr.error(data.message);
          }
        },
        (error: { message: string; }) => {
          this.toastr.error(error.message);
        }
      );
  }

  get f() {
    return this.signInForm.controls;
  }
}
