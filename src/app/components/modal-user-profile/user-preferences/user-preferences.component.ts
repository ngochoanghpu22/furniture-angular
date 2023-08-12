import { Component, Input, OnInit } from '@angular/core';
import {
  LanguageEnum, ManagerOrganizationService, AuthProvider, AuthenticationService,
  StaticDataService, User
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'fxt-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent implements OnInit {

  @Input() user: User;

  availableLanguages: { name: string, value: string }[];
  selectedLanguage: string;

  isSlackEnabled: boolean = false;
  isSlackConnected: boolean = false;
  isTeamEnabled: boolean = false;
  isBambooHREnabled: boolean = false;
  isLuccaEnabled: boolean = false;
  isWorkDayEnabled: boolean = false;
  isPayFitEnabled: boolean = false;
  isCegedimSRHEnabled: boolean = false;
  isSuccessFactorEnabled: boolean = false;

  authProvider: AuthProvider;

  constructor(
    private managerOrganizationService: ManagerOrganizationService,
    private translocoService: TranslocoService,
    private staticDataService: StaticDataService,
    private authService: AuthenticationService
  ) {
    this.authProvider = this.authService.currentUser.authProvider;
  }

  ngOnInit() {
    this.selectedLanguage = this.translocoService.getActiveLang();
    this.initListLanguages();
    this.isSlackEnabled = this.authService.isSlackEnabled;
    this.isSlackConnected = this.user.slackMemberId !== '' && this.user.slackMemberId !== null;
    // Note: Future enhancement when we are allowing connection with below Apps.
    this.isTeamEnabled = this.authService.isTeamsEnabled;
    this.isBambooHREnabled = this.authService.isBambooHREnabled;
    this.isLuccaEnabled = this.authService.isLuccaEnabled;
    this.isWorkDayEnabled = this.authService.isWorkDayEnabled;
    this.isPayFitEnabled = this.authService.isPayFitEnabled;
    this.isCegedimSRHEnabled = this.authService.isCegedimSRHEnabled;
    this.isSuccessFactorEnabled = this.authService.isSuccessFactorEnabled;
  }

  changeLang($event: any) {
    this.staticDataService.changeLanguage($event);
    this.initListLanguages();
  }

  private initListLanguages() {
    const obj$ = [
      this.translocoService.selectTranslate('main.english'),
      this.translocoService.selectTranslate('main.french')
    ];

    const sub = combineLatest(obj$).subscribe(labels => {
      this.availableLanguages = [
        { name: labels[0], value: LanguageEnum.En },
        { name: labels[1], value: LanguageEnum.Fr },
      ]
    });

    if (sub) sub.unsubscribe();

  }

  connectToSlack() {
    const target = this.managerOrganizationService.getSlackUrl(
      this.managerOrganizationService.getAccessPointUrl() + '/api/slack/callback',
      this.user.id
    );
    window.open(target, '_blank');
  }

}
