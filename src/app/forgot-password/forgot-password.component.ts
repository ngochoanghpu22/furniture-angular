import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FORGOT_PASSWORD_IMG, LOGO_IMG } from '@design-system/core';
import { AuthenticationService, MessageService } from '@flex-team/core';
@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  logoImg = LOGO_IMG;
  form: FormGroup;
  error_code = '';
  public img = FORGOT_PASSWORD_IMG;
  userId = '';
  constructor(
    private formBuilder: FormBuilder,
    private messageService: MessageService,
    private authenticationService: AuthenticationService,
    private authService: AuthenticationService
  ) { }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  resendInvitation() {
    this.authService.resendOnboardingLink(this.userId).subscribe(r => {
      this.messageService.success('notifications.new_onboarding_email_sent');
    })
  }
  onSubmit(): void {
    this.authenticationService.sendResetLink(this.form.controls.email.value)
      .subscribe(data => {
        if (data.errorCode === 'OK') {
          this.form.controls.email.setValue('');
          this.form.markAsUntouched();
          this.messageService.success('FORGOT_PASSWORD.send_link_success');
          return;
        }
        this.userId = data.errorMessage;
        this.error_code = data.errorCode;
      });
  }

}
