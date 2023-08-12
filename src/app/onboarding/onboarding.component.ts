import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuthenticationService,
  AuthProvider,
  Onboarding,
  OnboardingService, SelectionService, UserRole, Workload
} from '@flex-team/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { OnboardingViewService } from './services';

const Max_Pages_User = 5;
const Max_Pages_Manager = 6;

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
  providers: [OnboardingViewService]
})
export class OnboardingComponent implements OnInit {

  public actualPage: number = 1;
  public isOnlyUser: boolean = true;
  public skipHierarchyConfig: boolean = false;
  public skipFavoriteConfig: boolean = false;
  public maxPage: number = Max_Pages_User;

  constructor(
    private authService: AuthenticationService,
    private selectionService: SelectionService,
    private onboardingService: OnboardingService,
    private _viewService: OnboardingViewService,
    private router: Router,
    private route: ActivatedRoute) {

    const value = this.route.snapshot.queryParams['OnboardingToken'];
    this._viewService.onboardingToken = value || '';
  }

  ngOnInit(): void {
    const onboarding = this.onboardingService.onboarding;
    this._viewService.onboarding = { ...onboarding };
    this.skipHierarchyConfig = onboarding.skipHierarchyConfig
    this.skipFavoriteConfig = onboarding.skipFavoriteConfig
    this.isOnlyUser = this.authService.userHasRole(onboarding.owner, UserRole.User);
    this.maxPage = 2;
  }

  navigateTo(pageNumber: number) {

    this.actualPage = pageNumber;

    if (pageNumber == 100) {
      this.onSaveOnboarding();
    }
  }

  onSaveOnboarding() {
    this.selectionService.transformSelectionToFavoriteTeam(this._viewService.onboardingToken)
      .subscribe(_ => {

        const data = this._viewService.onboarding;
        const selectedLocation = this._viewService.selectedLocation;

        data.monday = selectedLocation[0];
        data.tuesday = selectedLocation[1];
        data.wednesday = selectedLocation[2];
        data.thursday = selectedLocation[3];
        data.friday = selectedLocation[4];

        data.inviteUsers = this._viewService.hierarchyTeam;
        data.hierarchyTeamName = this._viewService.hierarchyTeamName;

        this.onboardingService.saveOnboarding(data,
          this._viewService.hierarchyTeamName,
          this._viewService.password,
          this._viewService.onboardingToken,
          this._viewService.provider)
          .pipe(switchMap((resp: Workload<Onboarding>) => {
            return this.loginByProvider(resp.workload, this._viewService.provider,
              this._viewService.externalResult);
          })).subscribe(resp => {
            this.checkDataToLogin(resp);
          });
      });
  }

  back() {
    this.actualPage--;
  }

  loginByProvider(data: Onboarding, provider: AuthProvider, externalResult: any): Observable<any> {
    let action$: Observable<any>;
    switch (provider) {
      case AuthProvider.Google:
        action$ = this.authService.loginGoogleSSO(externalResult);
        break;
      case AuthProvider.Microsoft:
        action$ = this.authService.loginMicrosoftSSO(externalResult);
        break;
      default:
        action$ = this.authService.login(data.owner.email, this._viewService.password);
        break;
    }

    return action$;
  }

  checkDataToLogin(data: any) {
    if (data.errorCode == '') {
      data.workload.authProvider = this._viewService.provider;
      this.authService.currentUser = data.workload;
      this.authService.navigateAfterSuccessfullyLogin();
    } else {
      this.goHome();
    }
  }

  private goHome() {
    this.router.navigate(['/']);
  }
}
