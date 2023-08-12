import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { AuthenticationResult } from '@azure/msal-browser';
import { AuthenticationService, AuthProvider } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { SocialUser } from 'angularx-social-login';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { OnboardingViewService } from '../../services';
import { BaseStepComponent } from '../base-step.component';

@Component({
  selector: 'fxt-first-step',
  templateUrl: './first-step.component.html',
  styleUrls: ['./first-step.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FirstStepComponent extends BaseStepComponent {

  public ownerFullName: string = '';
  public ownerEmail: string = '';

  public sender = 'simon@flexteam.fr';
  public emailToText = '';

  AuthProviderEnum = AuthProvider;

  loadingStates: any = {};
  errorCode: string;

  constructor(
    private authService: AuthenticationService,
    private viewService: OnboardingViewService,
    private translocoService: TranslocoService,
    private cd: ChangeDetectorRef) {
    super(authService, viewService);
    this.step = 1;

  }

  ngOnInit() {
    super.ngOnInit();
    this._viewService.onboarding$.subscribe(data => {
      this.ownerFullName = data.owner.firstName;
      this.ownerEmail = data.owner.email;
      this.cd.markForCheck();
    });

  }

  continue(provider: AuthProvider) {
    this.errorCode = null;
    this.loadingStates = {};
    this.loadingStates[provider] = true;

    let action$: Observable<AuthenticationResult | SocialUser> = null;
    switch (provider) {
      case AuthProvider.None:
        this.navigate.emit(this.step + 1);
        break;
      case AuthProvider.Google:
        action$ = this.authService.launchPopupLoginGoogle();
        break;
      case AuthProvider.Microsoft:
        action$ = this.authService.launchPopupLoginMicrosoft();
        break;
      default:
        break;
    }

    if (action$) {
      action$.pipe(finalize(() => {
        this.loadingStates = {};
        this.cd.detectChanges();
      })).subscribe(resp => {
        const externalUser = this.externalUserInfo(resp, provider);
        if (externalUser.email != this.ownerEmail) {
          this.errorCode = 'USER_NOT_FOUND';
        } else {
          this._viewService.updatePersoInfos(externalUser, resp, provider);
          this.navigate.emit(100);
        }
      }, err => {
        this.errorCode = provider == AuthProvider.Google
          ? err.error : 'user_cancelled_flow';
      })
    }
  }

  private externalUserInfo(resp: any, provider: AuthProvider) {
    let obj: any = {};
    switch (provider) {
      case AuthProvider.Google:
        obj.email = resp.email;
        obj.firstName = resp.firstName;
        obj.lastName = resp.lastName;
        obj.fullName = resp.name;
        break;
      case AuthProvider.Microsoft:
        obj.email = resp.account.username;
        obj.fullName = resp.account.name;

        const splitted = resp.account.name.split(' ');
        obj.firstName = splitted[0];
        obj.lastName = splitted[splitted.length - 1];
    }

    return obj;
  }

}
