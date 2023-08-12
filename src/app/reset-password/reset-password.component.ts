import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LOGO_IMG, REGISTER_STEP2_IMG } from '@design-system/core';
import { AuthenticationService, MessageService } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  token: string = '';
  error_code: string = '';
  email: string = '';
  success = false;
  form: FormGroup;
  logoImg = LOGO_IMG;
  imgStep2 = REGISTER_STEP2_IMG;

  get f() {
    return this.form.controls;
  }

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private translate: TranslocoService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.token = this.activatedRoute.snapshot.queryParams.resetToken;
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    }, {
      validator: this.passwordConfirming
    });
  }

  passwordConfirming(c: AbstractControl): ValidationErrors | null {
    if (c.get('password')?.value !== c.get('confirmPassword')?.value) {
      return { notSame: true };
    }
    return null;
  }

  submit(): void {
    const value = { ...this.form.value };
    this.authService.resetPassword(value.password, this.token)
      .subscribe(data => {
        this.error_code = data.errorCode;
        if (data.errorMessage) {
          this.email = data.errorMessage;
        }
        if (data.errorCode === 'OK') {
          const msg = this.translate.translate('RESET_PASSWORD.reset_successful');
          this.form.controls['password'].disable();
          this.form.controls['confirmPassword'].disable();
          this.success = true;
          this.messageService.success(msg)
          this.router.navigate(['/login']);
        }
      });
  }

}
