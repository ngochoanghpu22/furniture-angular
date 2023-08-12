import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ModalAddEditComponent, ModalConfirmationComponent, ModalService } from '@design-system/core';
import {
  AuthenticationService, ManagerSettingService,
  MessageService, StaticDataService, Team, TeamVisibilityEnum, UpdateTeamDto, User, UserRole
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-manager-settings',
  templateUrl: './manager-settings.component.html',
  styleUrls: ['./manager-settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @ViewChild('actionsTmp') actionsTmp: TemplateRef<any> | null = null;
  @ViewChild('confirmRemove') confirmRemoveRef: TemplateRef<any>;

  users: User[] = [];
  teams: Team[] = [];
  originalTeamsString: string = null;

  showPanelAddUser = false;
  isFavorite = false;
  isOwnedByUser = false;
  loading = false;

  selectedTeam: Team;
  currentUser: User | null;

  canEditName: boolean = false;
  canEditDesc: boolean = false;

  fields: FormlyFieldConfig[];
  activeLang: string;

  hierarchyTeamsOwnedByCurrentUser: Team[];
  workingDays: string[];

  mandatoryOfficeDays: boolean[] = [];
  hasMandatoryOfficeDaysChanges = false;
  isShowCheckIcon: boolean = false;

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private managerSettingService: ManagerSettingService,
    private authService: AuthenticationService,
    private modalService: ModalService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService,
    private translocoService: TranslocoService,
    private fb: FormBuilder,
    private staticDataService: StaticDataService
  ) {
    this.workingDays = this.staticDataService.getWorkingDays({ long: false })
      .map(x => x.replace('.', ''));
  }

  ngOnInit() {
    this.authService.currentUser$.pipe(takeUntil(this._destroyed))
      .subscribe(data => {
        this.currentUser = data;
        this.cd.detectChanges();
      })

    this.activeLang = this.translocoService.getActiveLang();
    this.getBelongAndOwnedTeams(false);
  }

  getBelongAndOwnedTeams(doOpenLastItem: boolean) {
    this.managerSettingService.getBelongAndOwnedTeams().subscribe(resp => {
      this.teams = resp.workload.filter(x => !x.isPrefered);
      this.originalTeamsString = JSON.stringify(this.teams);
      this.hierarchyTeamsOwnedByCurrentUser = this.teams.filter(x => x.isHierarchy
        && x.idOwner == this.currentUser.id);

      this.initFormlyFields();

      const selectedIndex = doOpenLastItem ? this.teams.length - 1 : 0;
      this.selectTeam(this.teams[selectedIndex]);
    })
  }

  onBtnDeleteTeamClicked(team: Team) {
    let messageHtml = `${this.translocoService.translate('setting.confirm_remove_team')} <strong>${team.name}</strong> ?`;
    messageHtml += `<br/><i>${this.translocoService.translate('setting.confirm_remove_team_note')}<i>`;
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto',
      disableClose: true,
      data: {
        message: messageHtml
      }
    });

    modalRef.afterClosed$.subscribe((ok) => {
      if (ok) {
        this.deleteTeam(team);
      }
    });

  }

  deleteTeam(team: Team) {
    this.managerSettingService.deleteTeam(team.id).subscribe(resp => {
      if (resp.errorCode == 'OK') {
        this.messageService.success();
        this.getBelongAndOwnedTeams(false);
      } else {
        this.messageService.error();
      }
    })
  }

  clickTab(e: any, team: Team) {
    this.checkShowCheckIcon(team);
    const isSelected = team.id === this.selectedTeam?.id;
    if (isSelected) {
      if (this.isOwnedByUser && !this.isFavorite) {
        this.canEditName = true;
        e.stopPropagation()
      }
    } else {
      if (this.canEditName) {
        this.onInputEnter(this.selectedTeam);
      }
      this.selectTeam(team);
    }
  }

  clickDesc() {
    if (this.isOwnedByUser && !this.isFavorite) {
      this.canEditDesc = true;
    }
  }

  clickOutsideDesc() {
    if (this.canEditDesc && this.isShowCheckIcon) {
      this.onInputEnter(this.selectedTeam);
    }
  }

  checkShowCheckIcon(team: Team) {
    const originalDescription = this.getOriginalDescription(team);
    this.isShowCheckIcon = team.description != originalDescription;
  }

  getCurrentTeam(team: Team) {
    const currentTeam: Team = JSON.parse(this.originalTeamsString).find((o: { id: string; }) => o.id == team.id);
    return currentTeam;
  }

  getOriginalDescription(team: Team) {
    let originalDescription = null;
    const currentTeam = this.getCurrentTeam(team);
    if (currentTeam) {
      originalDescription = currentTeam?.description;
    }

    return originalDescription;
  }

  updateOriginalTeamsString(team: Team) {
    const teams: Team[] = JSON.parse(this.originalTeamsString);
    const index = teams.findIndex(t => t.id == team.id);
    if (index != -1) {
      teams[index] = team;
    }

    this.originalTeamsString = JSON.stringify(teams);
  }

  clickOutsideTab(team: Team) {
    if (this.isShowCheckIcon) {
      this.onInputEnter(team, null, true);

    }
  }

  onInputEnter(team: Team, e?: any, isClickOutsideTab: any = null) {
    if (e) {
      e.preventDefault();
    }
    this.checkShowCheckIcon(team);
    this.canEditName = false;
    const selectedIndex = this.teams.findIndex((oldTeam) => oldTeam.id === team.id);
    if (isClickOutsideTab || this.isShowCheckIcon && selectedIndex !== -1 && this.teams[selectedIndex].description === team.description && e?.keyCode == 13) {
      this.saveTeam(selectedIndex, team);
      if (e) {
        e.stopPropagation()
      }
    }
  }

  selectTeam(team: Team) {
    if (team.id == this.selectedTeam?.id) return;
    this.canEditName = false;
    this.selectedTeam = team;
    this.mandatoryOfficeDays = this.staticDataService.getConsolidatedMandatoryOfficeDays([team]);
    this.isFavorite = this.selectedTeam.isPrefered;
    this.isOwnedByUser = this.selectedTeam.idOwner === this.currentUser.id;
    this.showPanelAddUser = false;
    this.selectedTeam.description = this.getOriginalDescription(team);
    this.getUsersByTeam(team);
  }

  onRemove(user: User) {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: '400px',
      disableClose: true,
      data: {
        message: this.translocoService.translate('setting.do_you_want_to_dismiss_user_from_team', {
          username: user.fullName,
          teamName: this.selectedTeam.name
        })
      }
    });
    modalRef.afterClosed$.subscribe(ok => {
      if (ok) {
        this.removeUserFromTeam(this.selectedTeam.id, user.id);
      }
    })
  }

  onUserAdded(user: User) {
    this.getUsersByTeam(this.selectedTeam);
  }

  togglePanelAddUser() {
    this.showPanelAddUser = !this.showPanelAddUser;
  }

  openModalCreateTeam() {
    const model = new Team();
    model.idOwner = this.currentUser.id;

    const modalRef = this.modalService.open(ModalAddEditComponent, {
      width: 'auto',
      disableClose: true,
      data: {
        model: model,
        fields: this.fields,
      },
    });

    this._destroyed = new Subject<void>();

    modalRef.afterClosed$.subscribe((resp: any) => {
      this._destroyed.next();
      this._destroyed.complete();
      if (resp && resp.model) {
        model.isHierarchy = resp.rawValue.isHierarchy;
        model.isSocial = resp.rawValue.isSocial;
        model.visibility = TeamVisibilityEnum.Public;
        this.managerSettingService.createTeam(model).subscribe(resp => {
          this.getBelongAndOwnedTeams(true);
          this.messageService.success();
        })
      }
    });
  }

  toggleMandatory(dayIndex: number) {
    this.mandatoryOfficeDays[dayIndex] = !this.mandatoryOfficeDays[dayIndex];
    this.hasMandatoryOfficeDaysChanges = this.checkHasMandatoryOfficeDaysChanges();
  }

  saveMandatoryOfficeDaysAndNotify() {

    this.selectedTeam.isMonMandatory = this.mandatoryOfficeDays[0];
    this.selectedTeam.isTueMandatory = this.mandatoryOfficeDays[1];
    this.selectedTeam.isWedMandatory = this.mandatoryOfficeDays[2];
    this.selectedTeam.isThurMandatory = this.mandatoryOfficeDays[3];
    this.selectedTeam.isFriMandatory = this.mandatoryOfficeDays[4];

    const dto = <UpdateTeamDto>{
      ...this.selectedTeam
    }

    const selectedIndex = this.teams.findIndex((x) => x.id === this.selectedTeam.id);

    this.managerSettingService.updateTeamMandatoryOfficeDays(this.selectedTeam.id, dto)
      .subscribe(_ => {
        this.teams[selectedIndex] = this.selectedTeam;
        this.messageService.success();
        this.hasMandatoryOfficeDaysChanges = false;
      })
  }

  private checkHasMandatoryOfficeDaysChanges(): boolean {
    const beforeStates = this.staticDataService.getConsolidatedMandatoryOfficeDays([this.selectedTeam]);

    let hasChanges = false;
    for (let i = 0; i < beforeStates.length; i++) {
      if (beforeStates[i] !== this.mandatoryOfficeDays[i]) {
        hasChanges = true;
        break;
      }
    }

    return hasChanges;
  }

  private saveTeam(selectedIndex: number, team: Team) {
    const dto = <UpdateTeamDto>{ name: team.name, description: team.description };
    this.managerSettingService.updateTeam(team.id, dto).subscribe(_ => {
      this.teams[selectedIndex] = team;
      this.updateOriginalTeamsString(team);
      this.checkShowCheckIcon(team);
      this.messageService.success();
    })
  }

  private getUsersByTeam(team: Team) {
    this.loading = true;
    this.managerSettingService.getUsersByTeam(team.id).subscribe((data) => {
      this.loading = false;
      this.users = data.workload;
    })
  }

  private removeUserFromTeam(teamId: string, userIdToRemove: string) {
    this.managerSettingService.removeUserFromTeam(teamId, userIdToRemove).subscribe(data => {
      this.users = this.users.filter(x => x.id !== userIdToRemove);
      this.messageService.success('notifications.use_has_been_removed');
      this.cd.detectChanges();
    })
  }

  private initFormlyFields() {

    const hierarchyTeamOwned = this.hierarchyTeamsOwnedByCurrentUser[0];

    const hierarchyTooltip$ = hierarchyTeamOwned
      ? this.translocoService.selectTranslate('setting.hierarchy_exists_tooltip', {
        teamName: hierarchyTeamOwned.name
      })
      : this.translocoService.selectTranslate('setting.hierarchy_tooltip')

    const obj$ = [
      this.translocoService.selectTranslate('main.name'),
      this.translocoService.selectTranslate('main.description'),
      this.translocoService.selectTranslate('setting.owner'),
      this.translocoService.selectTranslate('setting.users_include'),
      this.translocoService.selectTranslate('setting.enter_emails_lines'),
      hierarchyTooltip$,
      this.translocoService.selectTranslate('setting.social_tooltip'),
      this.translocoService.selectTranslate('setting.work_tooltip'),
    ]
    const IsTeamManager = this.authService.currentUserHasRole(UserRole.TeamManager);

    const sub = combineLatest(obj$).subscribe(labels => {
      const optionsTeamType = [
        {
          key: 'isWorking',
          type: 'checkbox',
          defaultValue: IsTeamManager == true ? false : true,
          wrappers: ['checkbox-tooltip-wrapper'],
          templateOptions: <any>{
            tooltip: labels[7],
            label: 'Work'
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              field.form.get('isWorking').valueChanges
                .pipe(takeUntil(this._destroyed))
                .subscribe(val => {
                  const tabs = val ? [false, false] : [true, false];
                  ['isSocial', 'isHierarchy'].map((k, index) => {
                    if (field.form.get(k)) {
                      field.form.get(k).setValue(tabs[index], {
                        onlySelf: true,
                        emitEvent: false
                      });
                    }
                    field.model[k] = tabs[index];
                  })
                });
            }
          }
        },
        {
          key: 'isSocial',
          type: 'checkbox',
          defaultValue: false,
          wrappers: ['checkbox-tooltip-wrapper'],
          templateOptions: <any>{
            tooltip: labels[6],
            label: 'Social'
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              field.form.get('isSocial').valueChanges
                .pipe(takeUntil(this._destroyed))
                .subscribe(val => {
                  const tabs = val ? [false, false] : [true, false];
                  ['isWorking', 'isHierarchy'].map((k, index) => {
                    if (field.form.get(k)) {
                      field.form.get(k).setValue(tabs[index], {
                        onlySelf: true,
                        emitEvent: false
                      });
                    }
                    field.model[k] = tabs[index];
                  })
                });
            }
          }
        }
      ];

      if (this.authService.currentUserHasRole(UserRole.TeamManager)) {
        optionsTeamType.unshift(<any>{
          key: 'isHierarchy',
          type: 'checkbox',
          defaultValue: IsTeamManager == true ? true : false,
          wrappers: ['checkbox-tooltip-wrapper'],
          templateOptions: <any>{
            tooltip: labels[5],
            label: 'Hierarchy',
            disabled: hierarchyTeamOwned == null
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              field.form.get('isHierarchy').valueChanges
                .pipe(takeUntil(this._destroyed))
                .subscribe(val => {
                  const tabs = val ? [false, false] : [true, false];
                  ['isWorking', 'isSocial'].map((k, index) => {
                    if (field.form.get(k)) {
                      field.form.get(k).setValue(tabs[index], {
                        onlySelf: true,
                        emitEvent: false
                      });
                    }
                    field.model[k] = tabs[index];
                  })

                });
            }
          }
        })
      };

      this.fields = [
        {
          key: 'name',
          type: 'input',
          templateOptions: {
            label: labels[0],
            required: true,
          },
        },
        ...optionsTeamType
      ];
    })

    if (sub) sub.unsubscribe();

  }

}
