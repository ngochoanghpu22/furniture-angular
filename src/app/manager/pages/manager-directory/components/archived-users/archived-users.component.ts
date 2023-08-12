import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import { AuthenticationService, DirectoryArchivedUserDTO, DirectoryCurrentUserDTO, FileService, ManagerDirectoryService, ManagerOrganizationService, ManagerViewService, MessageService, PagedData } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalUserProfileComponent } from 'src/app/components';
import { BaseComponentHoldingUsersComponent } from '../base-component-holding-users.component';

@Component({
  selector: 'fxt-archived-users',
  templateUrl: './archived-users.component.html',
  styleUrls: ['../table-users.component.scss']
})
export class ArchivedUsersComponent extends BaseComponentHoldingUsersComponent {

  @ViewChild('dateTmp', { static: true })
  dateTmp: TemplateRef<any> | null = null;

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
    this.columns = [
      {
        name: 'main.name', prop: 'firstName', sortable: true,
        cellTemplate: this.fullNameTmp
      },
      { name: 'main.display_name', prop: 'fullName', sortable: false },
      { name: 'main.email', prop: 'email', sortable: true },
      {
        name: 'archived_office.archived_date', prop: 'archivedDate',
        cellTemplate: this.dateTmp, cellClass: 'cell-date', sortable: true
      },
    ];

    this.managerViewService.selection$.pipe(takeUntil(this._destroyed))
      .subscribe(selections => {
        this.selection = selections;
        this.setPage({ offset: 0 });
      })

  }

  restore(user: DirectoryArchivedUserDTO) {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto'
    });

    modalRef.afterClosed$.subscribe(isOk => {
      if (isOk) {
        this.managerDirectoryService.restoreUser(
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
      .getPagedArchivedUsers(this.authService.currentUser.idCompany, this.page, this.selection)
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

