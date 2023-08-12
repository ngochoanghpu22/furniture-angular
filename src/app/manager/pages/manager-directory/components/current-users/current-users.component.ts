import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import { AuthenticationService, DirectoryCurrentUserDTO, FileService, ManagerDirectoryService, ManagerOrganizationService, ManagerViewService, MessageService, PagedData } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalUserProfileComponent } from 'src/app/components';
import { BaseComponentHoldingUsersComponent } from '../base-component-holding-users.component';

const ColumnsNotAccessibleToAllUsers = [
  'integrationSSO',
  'remoteProfileName',
  'firstLogin', 'lastLogin'
]

@Component({
  selector: 'fxt-current-users',
  templateUrl: './current-users.component.html',
  styleUrls: ['../table-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrentUsersComponent extends BaseComponentHoldingUsersComponent {

  @ViewChild('dateTmp', { static: true })
  dateTmp: TemplateRef<any> | null = null;

  @ViewChild('avatarTmp', { static: true })
  avatarTmp: TemplateRef<any> | null = null;

  @ViewChild('fullNameTmp', { static: true })
  fullNameTmp: TemplateRef<any> | null = null;

  @ViewChild('checkTmp', { static: true })
  checkTmp: TemplateRef<any> | null = null;

  @ViewChild('chipTmp', { static: true })
  chipTmp: TemplateRef<any> | null = null;

  constructor(
    protected authService: AuthenticationService,
    protected modalService: ModalService,
    protected messageService: MessageService,
    protected managerOrganizationService: ManagerOrganizationService,
    protected managerDirectoryService: ManagerDirectoryService,
    protected fileService: FileService,
    protected translocoService: TranslocoService,
    protected cd: ChangeDetectorRef,
    private managerViewService: ManagerViewService
  ) {
    super(authService, modalService, messageService,
      managerOrganizationService, managerDirectoryService, fileService, translocoService, cd);
  }

  ngOnInit() {
    this.loadData();
    this.columns = [
      {
        name: 'main.avatar', prop: 'tinyPicture',
        cellTemplate: this.avatarTmp, cellClass: 'cell-avatar'
      },
      {
        name: 'main.name', prop: 'firstName', sortable: true,
        cellTemplate: this.fullNameTmp, cellClass: 'column-name', headerClass: 'column-name'
      },
      { name: 'main.email', prop: 'email', sortable: true },
      {
        name: 'main.hierarchical_team', prop: 'coreTeam', sortable: false,
        cellTemplate: this.chipTmp, minWidth: 100, cellClass: 'column-chip', headerClass: 'column-chip'
      },
      {
        name: 'main.slack_connection', prop: 'isSyncSlack',
        cellTemplate: this.checkTmp, cellClass: 'column-check', sortable: true
      },
      { name: 'main.existing_SSO_integration', prop: 'integrationSSO', sortable: true },
      { name: 'main.remote_profile_name', prop: 'remoteProfileName', sortable: true },
      { name: 'main.roles', prop: 'roleSerialized', sortable: true },
      {
        name: 'main.first_login', prop: 'firstLogin',
        cellTemplate: this.dateTmp, cellClass: 'cell-date', sortable: true
      },
      {
        name: 'main.last_login', prop: 'lastLogin',
        cellTemplate: this.dateTmp, cellClass: 'cell-date', sortable: true
      },
    ];

    if (!this.canEdit) {
      this.columns = this.columns.filter(x => ColumnsNotAccessibleToAllUsers.indexOf(<string>x.prop) < 0);
    }

    this.managerViewService.selection$.pipe(takeUntil(this._destroyed))
      .subscribe(selections => {
        this.selection = selections;
        this.setPage({ offset: 0 });
      })

  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  openUserProfilePopup(user: DirectoryCurrentUserDTO, $event: Event) {

    $event.preventDefault();
    $event.stopPropagation();

    this.modalService.open(ModalUserProfileComponent, {
      width: '550px',
      maxHeight: '85%',
      customClass: 'modal-user-profile',
      data: {
        user: user
      },
    });
  }

  archive(user: DirectoryCurrentUserDTO) {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: '550px',
      data: {
        message: this.translocoService.translate('directory.archive_user_confirmation', { email: user.email })
      }
    });

    modalRef.afterClosed$.subscribe(isOk => {
      if (isOk) {
        this.managerDirectoryService.archiveUserFromCompany(
          this.authService.currentUser.idCompany, user.id)
          .subscribe(_ => {
            this.setPage({ offset: 0 });
            this.messageService.success();
          })
      }
    })

  }

  setPage(pageInfo: any, sortProp?: string, sortOrder?: string) {
    this.loading = true;

    this.page.pageNumber = pageInfo.offset;
    this.page.sortProp = pageInfo.sortProp || sortProp;
    this.page.sortOrder = pageInfo.sortOrder || sortOrder;

    this.managerDirectoryService
      .getPagedCurrentUsers(this.authService.currentUser.idCompany, this.page, this.selection)
      .pipe(finalize(() => this.loading = false))
      .subscribe((pagedData: PagedData<any>) => {
        this.page = pagedData.page;
        this.rows = pagedData.data;
        this.cd.detectChanges();
      });
  }


}
