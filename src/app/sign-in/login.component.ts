import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  signInForm: FormGroup = new FormGroup({});;

  constructor(
    private formBuilder: FormBuilder
  ) {
    this.initSignInForm();
  }

  initSignInForm() {
    this.signInForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: [null, [Validators.required]]
    });
  }

  signIn() {
    let userDto: any = {};
    userDto.email = this.signInForm.controls['email'].value;
    userDto.password = this.signInForm.controls['password'].value;
  }
}
