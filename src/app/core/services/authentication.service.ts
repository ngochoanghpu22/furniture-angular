import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AuthenticationResult, PublicClientApplication } from '@azure/msal-browser';
import { GoogleLoginProvider, SocialAuthService, SocialUser } from 'angularx-social-login';
import { BehaviorSubject, from, Observable, of, throwError } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AppConfigService } from './config.service';
import { PlatformService } from './platform.service';
import {
  AuthProvider, ConfigurationDTO, FormatDates, LocalStorageKeys, TimeSlotTemplateDTO,
  User, UserMetadata, UserRole, Workload
} from './workloads';
import { ConfigurationType } from './workloads/enums/ConfigurationType.enum';

const Microsoft_Directory_Scopes = [
  "offline_access", "profile", "User.Read",
  "contacts.read", "User.ReadBasic.All", "User.Read.All",
  "User.ReadWrite.All", "Directory.Read.All",
  "Directory.ReadWrite.All", "Directory.AccessAsUser.All",
  "Calendars.ReadWrite"
];

const Microsoft_Login_Scopes = [
  "offline_access", "profile",
  "User.Read", "Calendars.ReadWrite",
  "Place.Read.All"
];

declare var LOU: any;

@Injectable()
export class AuthenticationService extends BaseApiService {
  public showOverflow = false;
  private _googleService: SocialAuthService;
  private _msalService: MsalService;

  get isMobile() {
    return this.platform.isMobile(window);
  }

  get isLandscape() {
    return this.platform.isLandscape(window);
  }


  get googleService(): SocialAuthService {
    if (this._googleService == null) {
      this._googleService = new SocialAuthService({
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(this.appConfigService.config.googleClientId, {
              scope: this.appConfigService.config.googleLoginScope
            })
          }
        ]
      });
    }
    return this._googleService;
  }

  get msalService(): MsalService {
    if (this._msalService == null) {
      const config = new PublicClientApplication({
        auth: {
          clientId: this.appConfigService.config.msalClientId,
          redirectUri: location.origin
        }
      });
      this._msalService = new MsalService(config, this.locationService);
    }
    return this._msalService;
  }

  private _currentUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  currentUser$: Observable<User | null> = this._currentUser.asObservable();

  get formatDate(): string {
    const formatInLocal = localStorage.getItem(LocalStorageKeys.FormatDate);
    if (formatInLocal == null) {
      localStorage.setItem(LocalStorageKeys.FormatDate, FormatDates.ddMMyyyy);
    }
    return localStorage.getItem(LocalStorageKeys.FormatDate);
  }

  get formatDateTime(): string {
    return `${this.formatDate} HH:mm`;
  }

  get currentUser(): any | null {
    const storedUser = localStorage.getItem(LocalStorageKeys.CurrentUser);
    if (storedUser != null) return JSON.parse(storedUser);
    return null;
  }

  set currentUser(val: any | null) {
    this._currentUser.next(val);
    // if (LOU != null) {
    //   if (val != null) {
    //     LOU.identify(val.id);
    //   }
    //   else {
    //     LOU.identify({ isAuthenticated: false });
    //   }
    // }

    if (val != null) {
      localStorage.setItem(LocalStorageKeys.CurrentUser, JSON.stringify(val));
    } else {
      localStorage.removeItem(LocalStorageKeys.CurrentUser);
    }
  }

  set isImpersonate(val: any) {
    if (val === true) {
      localStorage.setItem(LocalStorageKeys.IsImpersonate, JSON.stringify(val));
    } else {
      localStorage.removeItem(LocalStorageKeys.IsImpersonate);
    }
  }

  get isImpersonate(): any {
    return localStorage.getItem(LocalStorageKeys.IsImpersonate);
  }

  get userIsManager(): boolean {
    return this.currentUserHasOneRole([
      UserRole.FullManager, UserRole.StatManager,
      UserRole.TeamManager, UserRole.HRManager,
      UserRole.OrganizationManager
    ]);
  }

  get userIsAdmin(): boolean {
    return this.currentUserHasRole(UserRole.Admin);
  }

  get isAuthenticated(): boolean {
    const storedUser = localStorage.getItem(LocalStorageKeys.CurrentUser);
    return storedUser != null;
  }

  get isFloatingReservationsEnabled(): boolean {
    return this.currentUserHasConfiguration(ConfigurationType.FloatingReservations).toUpperCase() === "TRUE";
  }

  get isMapCapabilitiesEnabled(): boolean {
    return this.currentUserHasConfiguration(ConfigurationType.MapCapabilities).toUpperCase() === "TRUE";
  }

  get limitBookingInFuture(): number {
    return parseInt(this.currentUserHasConfiguration(ConfigurationType.LimitBookingInFuture));
  }

  get isSlackEnabled(): boolean {
    return this.currentUserHasConfiguration(ConfigurationType.IsSlackEnabled).toUpperCase() === "TRUE";
  }

  get IsHalfDaysEnabled(): boolean {
    return this.currentUserHasConfiguration(ConfigurationType.IsHalfDaysEnabled).toUpperCase() === "TRUE";
  }

  get isTeamsEnabled(): boolean {
    return this.currentUserHasConfiguration(ConfigurationType.IsTeamsEnabled).toUpperCase() === "TRUE";
  }

  get isBambooHREnabled(): boolean {
    return this.currentUserHasConfiguration(ConfigurationType.IsBambooHREnabled).toUpperCase() === "TRUE";
  }

  get isLuccaEnabled(): boolean {
    return this.currentUserHasConfiguration(ConfigurationType.IsLuccaEnabled).toUpperCase() === "TRUE";
  }

  get isWorkDayEnabled(): boolean {
    return this.currentUserHasConfiguration(ConfigurationType.IsWorkDayEnabled).toUpperCase() === "TRUE";
  }

  get isPayFitEnabled(): boolean {
    return this.currentUserHasConfiguration(ConfigurationType.IsPayFitEnabled).toUpperCase() === "TRUE";
  }

  get isCegedimSRHEnabled(): boolean {
    return this.currentUserHasConfiguration(ConfigurationType.IsCegedimSRHEnabled).toUpperCase() === "TRUE";
  }

  get isSuccessFactorEnabled(): boolean {
    return this.currentUserHasConfiguration(ConfigurationType.IsSuccessFactorEnabled).toUpperCase() === "TRUE";
  }

  get isHalfDaysEnabled(): boolean {
    return this.currentUserHasConfiguration(ConfigurationType.IsHalfDaysEnabled).toUpperCase() === "TRUE";
  }

  get IsNeoNomadLayerEnabled(): boolean {
    return this.currentUserHasConfiguration(ConfigurationType.IsNeoNomadLayerEnabled).toUpperCase() === "TRUE";
  }

  get timeSlotTemplates(): TimeSlotTemplateDTO[] {
    return this.currentUser.timeSlotTemplates;
  }

  constructor(
    protected http: HttpClient,
    private locationService: Location,
    private appConfigService: AppConfigService,
    private platform: PlatformService,
    private router: Router
  ) {
    super(http);
    this._currentUser.next(this.currentUser);
  }

  updateUser(dto: Partial<User>) {
    const user = this.currentUser;
    if (user != null) {
      user.firstName = dto.firstName || '';
      user.lastName = dto.lastName || '';
      user.fullName = dto.fullName || '';
      this.currentUser = user;
    }
  }

  updateMetadata(metadata: Partial<UserMetadata>) {
    this.currentUser = {
      ...this.currentUser,
      metadata: {
        ...this.currentUser.metadata,
        ...metadata
      }
    };
  }

  /**
   * Update format date in localstorage
   * @param format 
   */
  updateFormatDate(format: string) {
    localStorage.setItem(LocalStorageKeys.FormatDate, format);
  }

  /**
   * Update configuration in localstorage
   * @param conf 
   * @param confType 
   */
  updateConfiguration(conf: ConfigurationDTO, confType: ConfigurationType) {
    // const currentUser = this.currentUser;
    // const index = currentUser.configurations.findIndex(x => x.type == confType);
    // if (index >= 0) {
    //   currentUser.configurations[index].value = conf.value;
    // }

    // this.currentUser = {
    //   ...currentUser,
    //   configurations: [...currentUser.configurations]
    // }
  }

  public currentUserHasConfiguration(type: ConfigurationType): string {
    // const found = this.currentUser.configurations.find(x => x.type === type);
    // return found?.value;

    return "";
  }

  public currentUserHasRole(role: UserRole): boolean {
    return this.userHasRole(this.currentUser, role);
  }

  public currentUserHasOneRole(roles: UserRole[]): boolean {
    return this.userHasOneRole(this.currentUser, roles);
  }

  public userHasRole(user: User | null, role: UserRole): boolean {
    if (user == null) {
      return false;
    }
          
    return user.role == role;
  }

  public userHasOneRole(user: User | null, roles: UserRole[]): boolean {
    if (user == null || roles == null)
      return false;
    else
      for (var i = 0; i < roles.length; i++) {
        if (this.userHasRole(user, roles[i]))
          return true;
      }
    return false;
  }

  public login(username: string, password: string): Observable<Workload<User>> {
    return this.http
      .post<Workload<User>>(this.accessPointUrl + '/api/Authentication/Login',
        { username: username, password: password });
  }

  public resendOnboardingLink(id: string): Observable<Workload<User>> {
    return this.http
      .post<Workload<User>>(this.accessPointUrl + '/api/Authentication/ResendOnboardingLink',
        { id });
  }

  public sendResetLink(login: string): Observable<Workload<User>> {
    // Get all jogging data
    return this.http
      .post<Workload<User>>(this.accessPointUrl + '/api/Authentication/SendResetLink',
        { email: login });
  }

  public resetPassword(password: string, token: string): Observable<Workload<User>> {
    return this.http
      .post<Workload<any>>(this.accessPointUrl + '/api/Authentication/ResetPassword',
        { password, token });
  }

  public checkExisting(email: string): Observable<Workload<User>> {
    return this.http
      .post<Workload<any>>(this.accessPointUrl + '/api/Authentication/CheckExisting',
        { email });
  }

  public register(user: User): Observable<Workload<any>> {
    return this.http.post<Workload<any>>(this.accessPointUrl + '/api/Authentication/Register', user);
  }

  public logout(authProvider: AuthProvider) {
    this.currentUser = null;
    this.isImpersonate = false;
    if (authProvider == AuthProvider.Google) {
      this._googleService.signOut();
    }
    if (authProvider == AuthProvider.Microsoft) {
      this._msalService.logout();
    }
  }

  //If you change this method without my (CTO) consent, i will find you and i will kill you (TAKEN)
  public importMicrosoftDirectory(): Observable<AuthenticationResult> {
    return this.msalService.loginPopup({ scopes: Microsoft_Directory_Scopes });
  }

  public loginMicrosoft(): Observable<Workload<any>> {
    return this.msalService.loginPopup({ scopes: Microsoft_Login_Scopes })
      .pipe(switchMap((response: AuthenticationResult) => {
        this.msalService.instance.setActiveAccount(response.account);
        return this.loginMicrosoftSSO(response);
      }));
  }

  public acquireMicrosoftTokenSilent(): Observable<AuthenticationResult> {
    return this.msalService.acquireTokenSilent({ scopes: Microsoft_Login_Scopes });
  }

  public loginGoogle(): Observable<any> {
    return this.googleService.initState.pipe(switchMap(isInit => {
      if (isInit) {
        return new Observable(observer => {
          this.googleService.signIn(GoogleLoginProvider.PROVIDER_ID)
            .then(response => {
              this.loginGoogleSSO(response).subscribe(data => {
                observer.next(data);
              }, err => observer.error(err))
            }, err => {
              observer.error(err);
            })
        })
      } else {
        return throwError({ error: "GoogleService is not initialized" });
      }
    }))

  }

  public launchPopupLoginGoogle(): Observable<SocialUser> {
    return this.googleService.initState.pipe(switchMap(isInit => {
      if (isInit) {
        return from(this.googleService.signIn(GoogleLoginProvider.PROVIDER_ID));
      } else {
        return of(null);
      }
    }));
  }

  public launchPopupLoginMicrosoft(): Observable<AuthenticationResult> {
    return this.msalService.loginPopup({ scopes: Microsoft_Login_Scopes })
      .pipe(tap((resp: AuthenticationResult) => {
        this.msalService.instance.setActiveAccount(resp.account);
      }));
  }

  /**
   * Login Microsoft SSO
   * @param result 
   * @returns 
   */
  public loginMicrosoftSSO(result: AuthenticationResult): Observable<Workload<any>> {
    return this.http
      .post<Workload<string>>(this.accessPointUrl + `/api/Authentication/loginMicrosoftSSO`, {
        token: result.idToken
      });
  }

  /**
   * Login google SSO
   * @param response 
   * @returns 
   */
  public loginGoogleSSO(data: SocialUser): Observable<Workload<any>> {
    const response = data.response;
    return this.http
      .post<Workload<string>>(this.accessPointUrl + `/api/Authentication/loginGoogleSSO`,
        {
          token: response.access_token,
          expiresIn: response.expires_in,
          refreshToken: response.id_token,
          scope: response.scope
        } as any);
  }

  public navigateAfterSuccessfullyLogin() {
    const isManager = this.userIsManager;
    const isAdmin = this.userIsAdmin;
    const isDesktop = !this.isMobile;

    const version = this.isMobile ? 'Mobile' : 'Desktop';
    console.info(`Detected version: ${version}`);

    if ((isDesktop || this.isLandscape)) {
      this.router.navigate(['/manager']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

}
