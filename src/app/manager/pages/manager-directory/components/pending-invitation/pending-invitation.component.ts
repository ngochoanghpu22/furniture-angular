import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import { AuthenticationService, DirectoryCurrentUserDTO, DirectoryPendingUserDTO, FileService, ManagerDirectoryService, ManagerOrganizationService, ManagerViewService, MessageService, PagedData } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalUserProfileComponent } from 'src/app/components';
import { BaseComponentHoldingUsersComponent } from '../base-component-holding-users.component';

@Component({
  selector: 'fxt-pending-invitation',
  templateUrl: './pending-invitation.component.html',
  styleUrls: ['../table-users.component.scss']
})
export class PendingInvitationComponent extends BaseComponentHoldingUsersComponent {

  @ViewChild('dateTmp', { static: true })
  dateTmp: TemplateRef<any> | null = null;

  @ViewChild('chipTmp', { static: true })
  chipTmp: TemplateRef<any> | null = null;

  @ViewChild('fullNameTmp', { static: true })
  fullNameTmp: TemplateRef<any> | null = null;

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
        name: 'main.name', prop: 'firstName', sortable: true,
        cellTemplate: this.fullNameTmp
      },
      { name: 'main.email', prop: 'email', sortable: true },
      {
        name: 'main.hierarchical_team', prop: 'coreTeam', sortable: false,
        cellTemplate: this.chipTmp, minWidth: 100, cellClass: 'column-chip', headerClass: 'column-chip'
      },
      { name: 'main.inviter', prop: 'inviterFullName', sortable: true },
      {
        name: 'main.invited_date', prop: 'invitedDate',
        cellTemplate: this.dateTmp, cellClass: 'cell-date',
        sortable: true
      }
    ];

    this.managerViewService.selection$.pipe(takeUntil(this._destroyed))
      .subscribe(selections => {
        this.selection = selections;
        this.setPage({ offset: 0 });
      })
  }

  resendOnboardingLink(user: DirectoryPendingUserDTO) {
    this.managerDirectoryService.resendOnboardingLink(user.id).subscribe(_ => {
      this.messageService.success('notifications.new_onboarding_email_sent');
    });
  }

  remove(item: DirectoryPendingUserDTO) {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto',
      disableClose: true,
    });

    modalRef.afterClosed$.subscribe(isOK => {
      if (isOK) {
        this.managerDirectoryService.removePendingUser(this.authService.currentUser.idCompany, item.id)
          .subscribe(_ => {
            this.rows = this.rows.filter((x) => x.id != item.id);
            this.rows = [...this.rows];
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
      .getPagedPendingUsers(this.authService.currentUser.idCompany, this.page, this.selection)
      .pipe(finalize(() => this.loading = false))
      .subscribe((pagedData: PagedData<any>) => {
        this.page = pagedData.page;
        this.rows = pagedData.data;
        this.cd.detectChanges();
      });
  }

  openUserProfilePopup(user: DirectoryCurrentUserDTO, $event: Event) {

    $event.preventDefault();
    $event.stopPropagation();

    this.modalService.open(ModalUserProfileComponent, {
      width: '550px',
      customClass: 'modal-user-profile',
      data: {
        user: user
      },
    });
  }

}


