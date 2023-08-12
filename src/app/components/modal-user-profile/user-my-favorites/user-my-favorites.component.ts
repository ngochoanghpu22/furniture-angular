import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import { AuthenticationService, BookingLocationResponse, ManagerSettingService, MessageService, ProfileService, StaticDataService, Team, TimeSlotTemplateDTO, User } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { LocationProviderService } from '../location-provider.service';

@Component({
  selector: 'fxt-user-my-favorites',
  templateUrl: './user-my-favorites.component.html',
  styleUrls: ['./user-my-favorites.component.scss']
})
export class UserMyFavoritesComponent implements OnInit {

  @Input() user: User;
  @Input() isCurrentUser = false;
  @Input() canEditDefaultWeek = false;

  favoriteColleagues: User[] = [];
  dayValidationPeriod = 0;

  loading: boolean = false;
  showPanelAddUser = false;
  favoriteTeam: Team;

  halfDayEnabled: boolean = false;
  timeSlotTemplates: TimeSlotTemplateDTO[];

  constructor(
    private profileService: ProfileService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService,
    private managerSettingService: ManagerSettingService,
    private translocoService: TranslocoService,
    private modalService: ModalService,
    private locationProviderService: LocationProviderService,
    private staticDataService: StaticDataService,
    private authService: AuthenticationService,
  ) {
    this.halfDayEnabled = this.authService.IsHalfDaysEnabled;
    this.timeSlotTemplates = this.authService.timeSlotTemplates;
  }

  ngOnInit() {
    this.getFavouriteTeam();
    this.getBelongAndOwnedTeams();
  }

  private getFavouriteTeam() {
    this.profileService.getFavoriteColleagues().subscribe((resp) => {
      this.favoriteColleagues = resp.workload;
      this.cd.detectChanges();
    })
  }

  trackByFn(index: number, item: any): string {
    return item.id;
  }

  getBelongAndOwnedTeams() {
    this.managerSettingService.getBelongAndOwnedTeams().subscribe(resp => {
      this.favoriteTeam = resp.workload.find(x => x.isPrefered);
    })
  }

  togglePanelAddUser() {
    this.showPanelAddUser = !this.showPanelAddUser;
  }

  removeUser(user: User) {

    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: '400px',
      disableClose: true,
      data: {
        message: this.translocoService.translate('setting.do_you_want_to_dismiss_user_from_team', {
          username: user.fullName,
          teamName: this.favoriteTeam.name
        })
      }
    });

    modalRef.afterClosed$.subscribe(ok => {
      if (ok) {
        this.removeUserFromTeam(this.favoriteTeam.id, user.id);
      }
    })
  }

  private removeUserFromTeam(teamId: string, userIdToRemove: string) {
    this.managerSettingService.removeUserFromTeam(teamId, userIdToRemove).subscribe(data => {
      this.getFavouriteTeam();
      this.messageService.success('notifications.use_has_been_removed');
    })
  }

  onUserAdded(user: User) {
    this.getFavouriteTeam();
  }

  onUpdatePreferedWeekFailed($event: { dayIndex: number, response: BookingLocationResponse }) {

    const payload = {
      dayName: this.staticDataService.getWorkingDays({ long: true })[$event.dayIndex]
    };

    this.locationProviderService.displayPopupConfirmationToBookOrWarning($event.response, payload)
      .subscribe(() => { });
  }

}
