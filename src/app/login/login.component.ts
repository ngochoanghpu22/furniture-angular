import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BrowserAuthError } from '@azure/msal-browser';
import { FxtAnimations, LOGIN_IMG, LOGO_IMG, ModalInformationComponent, ModalService } from '@design-system/core';
import {
  AuthenticationService, AuthProvider,
  LocalStorageKeys,
  MessageService
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { DataTableBodyCellComponent } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [FxtAnimations.fadeOut]
})
export class LoginComponent implements OnInit {

  AuthProviderEnum = AuthProvider;

  loginForm: FormGroup;
  loading = false;

  authProvider: AuthProvider = AuthProvider.None;

  showPassword = false;
  errorCode = '';
  apiError = false;
  userId = '';
  loginImg = LOGIN_IMG;
  logoImg = LOGO_IMG;
  version = (<any>window).INTERNAL_Version.version;

  showRegister = false;
  showResend = false;

  isImpersonate = false;

  get f() {
    return this.loginForm.controls;
  }

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService,
    private modalService: ModalService,
    private translocoService: TranslocoService,
    protected http: HttpClient,
    private toastr: ToastrService,
  ) {
    //If onboarding, navigate
    this.route.queryParams.subscribe((params) => {
      if (
        params['OnboardingToken'] != '' &&
        params['OnboardingToken'] != null
      ) {
        this.router.navigate([
          '/onboarding',
          { OnboardingToken: params['OnboardingToken'] },
        ]);
      }
    });

    this.isImpersonate = this.route.snapshot.queryParams.login != null;

    this.loginForm = this.formBuilder.group({
      username: [this.route.snapshot.queryParams.login, [Validators.required]],
      password: [{ value: '', disabled: this.isImpersonate }, !this.isImpersonate ? Validators.required : null],
    });
  }

  ngOnInit() {
  }

  resendInvitation() {
    this.authService.resendOnboardingLink(this.userId).subscribe(r => {
      this.messageService.success('notifications.new_onboarding_email_sent');
    })
  }

  onSubmit(): void {

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.apiError = false;

    this.authProvider = AuthProvider.None;

    this.authService
      .login(
        this.loginForm.controls.username.value,
        this.loginForm.controls.password.value
      )
      .subscribe(
        (data) => {
          this.checkDataToLogin(data);
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          this.handleErrorCode(error)
        }
      );
  }

  public logoutAll() {
    this.authService.logout(this.authProvider);
  }

  public loginMicrosoft() {
    this.loading = true;
    this.apiError = false;

    this.authProvider = AuthProvider.Microsoft;
    this.authService.loginMicrosoft()
      .pipe(finalize(() => this.loading = false))
      .subscribe(data => {
        this.checkDataToLogin(data);
      }, (error: BrowserAuthError) => {
        console.warn("Error login Microsoft: ", error.errorMessage);
        this.handleErrorCode(error.errorCode);
      });
  }

  public loginGoogle() {
    this.loading = true;
    this.apiError = false;
    this.authProvider = AuthProvider.Google;

    this.authService.loginGoogle()
      .pipe(finalize(() => this.loading = false))
      .subscribe(data => {
        this.checkDataToLogin(data);
      }, error => {
        console.warn("Error login Google: ", error.error);
        this.handleErrorCode(error.error);
      });
  }

  checkDataToLogin(data: any) {
    if (data.isSuccessed) {

      this.authService.currentUser = data.resultObj;
      this.router.navigate(['/manager/list-task']);

      // data.workload.authProvider = this.authProvider;
      // this.authService.currentUser = data.workload;
      // this.authService.isImpersonate = this.isImpersonate;

      
      //this.authService.navigateAfterSuccessfullyLogin();
    }
    else {
      this.loading = false;
      this.toastr.error(data.message);

      /*
      this.handleErrorCode(data.errorCode)
      this.apiError = true;

      if (data.errorMessage) {
        this.userId = data.errorMessage;
      }
      this.router.navigate(['/']);
      */
    }
  }

  handleErrorCode(errorCode: string) {
    this.errorCode = errorCode;

    if (this.errorCode !== null && this.errorCode.endsWith("_POPUP")) {
      this.modalService.open(ModalInformationComponent, {
        width: 'auto',
        data: {
          message: this.translocoService.translate("LOGIN." + this.errorCode)
        },
      });
    }

    switch (this.errorCode) {
      case "USER_NOT_LOGGED":
      case "USER_NOT_FOUND":
      case "USER_WITH_SAME_EMAIL_ALREADY_EXISTS":
      case "NEW_USER_NOT_IN_DOMAIN":
      case "UNABLE_TO_CONNECT_TO_API":
      case "UNABLE_TO_CONNECT_TO_GOOGLE_API":
      case "USER_PASSWORD_MISMATCH":
      case "ACCOUNT_ALREADY_EXISTS":
      case "USER_ALREADY_EXISTS":
        this.showRegister = true;
        //this.showResend = false;
        break;
      case "USER_NOT_COMPLETED_ONBOARDING":
      case "USER_NOT_COMPLETED_ONBOARDING_POPUP":
      case "USER_NOT_COMPLETED_ONBOARDING_WHILE_REGISTER":
        this.showRegister = false;
        //this.showResend = true;
        break;
      default:
        this.showRegister = false;
        //this.showResend = false;
        break;
    }

  }

}
