import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService, AuthInterceptor, Guid_Empty, LocalStorageKeys, ProfileService, StaticDataService, User, Workload } from './core';
import { LanguageEnum } from '@flex-team/core';

const Pages_Hide_Footer: string[] = [
  '/login', '/onboarding', '/manager',
  '/admin', 'register', 'forgot-password', 'reset-password'
];

const DEFAULT_LANG = 'en-US';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'Traffic';

  subscription: Subscription | null = null;

  hideFooter: boolean = true;
  fullScreen: boolean = false;

  constructor(private router: Router,
    @Inject(LOCALE_ID) private locale: string,
    private staticDataService: StaticDataService,
    public authService: AuthenticationService,
    private profileService: ProfileService
  ) {
    this.setupLocale(this.locale);
    if (this.authService.isImpersonate) {
      this.authService.isImpersonate = false;
      this.authService.currentUser = null;
    }
  }

  ngOnInit() {
    this.subscription = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd || event instanceof NavigationStart) {
        this._checkHideFooter(event);
      }
    });

    //this.getProfileInfo();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  /**
   * `Call API` Get profile info
   */
  private getProfileInfo() {
    this.profileService.getProfileInfo().subscribe((resp: Workload<User>) => {
      if (!resp.errorCode && resp.workload.id !== Guid_Empty) {
        this.authService.currentUser = resp.workload;
      }
    })
  }

  private setupLocale(predefinedLocale: string) {
    console.info(`APP - Predefined: ${predefinedLocale}, Navigator: ${navigator?.language}`);
    const localLang = localStorage.getItem(LocalStorageKeys.Language)
    const browserLang = navigator?.language?.split('-')[0]

    let currentLang = localLang || predefinedLocale || DEFAULT_LANG;
    if (!localLang && browserLang) {
      currentLang = browserLang === LanguageEnum.Fr ? LanguageEnum.Fr : LanguageEnum.En
    }

    this.staticDataService.changeLanguage(currentLang.split('-')[0]);
  }

  private _checkHideFooter(event: NavigationEnd | NavigationStart) {
    const url = event instanceof NavigationEnd ? event.urlAfterRedirects : event.url;

    if (url == '/') {
      this.hideFooter = true;
      return;
    }

    let hideFooter = false;
    for (let i = 0; i < Pages_Hide_Footer.length; i++) {
      if (url && url.indexOf(Pages_Hide_Footer[i]) >= 0) {
        hideFooter = true;
        this.fullScreen = Pages_Hide_Footer[i] === '/onboarding';
        break;
      }
    }

    this.hideFooter = hideFooter;
  }


}
