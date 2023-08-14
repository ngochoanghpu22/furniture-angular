import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SignInService } from '../sign-in/sign-in.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { REGEX_PATTERN } from '../core/regex/regex';
import { SignUpService } from './sign-up.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  show: boolean = false;

  signUpForm: FormGroup = new FormGroup({});

  /**
   *
   */
  constructor(private formBuilder: FormBuilder,
    private signUpService: SignUpService,
    private toastr: ToastrService,
    protected router: Router) 
  {
    this.initSignUpForm();
  }

  initSignUpForm() {
    this.signUpForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern(REGEX_PATTERN.EMAIL)]],
      password: ['', [Validators.required]],
      name: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(REGEX_PATTERN.PHONE)]],
    });
  }

  showText() {
    this.show = !this.show;
  }

  signUp() {
    let userDto: any = {};
    userDto.name = this.signUpForm.controls['name'].value;
    userDto.email = this.signUpForm.controls['email'].value;
    userDto.password = this.signUpForm.controls['password'].value;
    userDto.phone = this.signUpForm.controls['phone'].value;
    userDto.role = "User";

    this.signUpService
      .signUp(userDto)
      .subscribe(
        (data: any) => {
          if (data.isSuccessed) {
            this.router.navigate(['/sign-in']);
            this.toastr.success("Sign-Up successfully.");
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
    return this.signUpForm.controls;
  }
}
