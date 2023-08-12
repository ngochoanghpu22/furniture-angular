import { Component, Input, OnInit } from '@angular/core';
import { ModalChangeBasicInformationsComponent, ModalService, UserAddressComponent } from '@design-system/core';
import { AuthenticationService, LanguageEnum, ManagerOrganizationService, StaticDataService, User } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'fxt-other-info',
  templateUrl: './other-info.component.html',
  styleUrls: ['./other-info.component.scss'],
})
export class OtherInfoComponent implements OnInit {
  @Input() user: User;

  get metadata() {
    return this.user?.metadata;
  }

  availableLanguages: { name: string, value: string }[];
  selectedLanguage: string;

  constructor(
    private modalService: ModalService,
    private authService: AuthenticationService,
    private service: ManagerOrganizationService,
    private translocoService: TranslocoService,
    private staticDataService: StaticDataService
  ) { }

  ngOnInit() {
    this.selectedLanguage = this.translocoService.getActiveLang();
    this.initListLanguages();
  }

  openModal() {
    this.modalService.open(ModalChangeBasicInformationsComponent, {
      width: 'auto',
      data: this.user,
    });
  }

  openAddressModal() {
    this.modalService.open(UserAddressComponent, {
      data: this.metadata,
    });
  }

  connectToSlack() {
    const target = this.service.getSlackUrl(
      this.service.getAccessPointUrl() + '/api/slack/callback',
      this.authService.currentUser.id
    );
    window.open(target, '_blank');
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
}
