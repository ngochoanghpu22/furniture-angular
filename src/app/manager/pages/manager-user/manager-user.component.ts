import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import { AuthenticationService, DirectoryCurrentUserDTO, FileService, ManagerDirectoryService, ManagerOrganizationService, ManagerViewService, MessageService, Page, PagedData, SelectionItem } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { TableColumn } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalUserProfileComponent } from 'src/app/components';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { UserService } from 'src/app/core/services/user-service/user.service';
import { Role } from 'src/app/core/services/workloads/enums/role.enum';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserStatus } from 'src/app/core/services/workloads/enums/user-status.enum';

const ColumnsNotAccessibleToAllUsers = [
  'integrationSSO',
  'remoteProfileName',
  'firstLogin', 'lastLogin'
]

@Component({
  selector: 'fxt-manager-users',
  templateUrl: './manager-user.component.html',
  styleUrls: ['./manager-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagerUserComponent {

  @ViewChild('statusTmp', { static: true })
  statusTmp: TemplateRef<any> | null = null;

  @ViewChild('avatarTmp', { static: true })
  avatarTmp: TemplateRef<any> | null = null;

  @ViewChild('fullNameTmp', { static: true })
  nameTmp: TemplateRef<any> | null = null;

  @ViewChild('checkTmp', { static: true })
  addressTmp: TemplateRef<any> | null = null;

  @ViewChild('chipTmp', { static: true })
  phoneTmp: TemplateRef<any> | null = null;

  @ViewChild('actionTmp', { static: true })
  actionTmp: TemplateRef<any> | null = null;

  page = new Page();

  columns: TableColumn[];
  loading = false;

  protected _destroyed = new Subject<void>();
  selection: SelectionItem[] = [];
  SelectionType = SelectionType;
  rows = new Array<any>();

  oldSortProp: string;
  oldSortOrder: string;

  ColumnMode = ColumnMode;

  isActive = true;
 
  canEditUser = false;

  constructor(
    private router: Router,
    protected authService: AuthenticationService,
    protected modalService: ModalService,
    protected messageService: MessageService,
    protected userService: UserService,
    protected translocoService: TranslocoService,
    protected cd: ChangeDetectorRef,
    private managerViewService: ManagerViewService,
    private toastr: ToastrService
  ) {
   
  }

  ngOnInit() {
    const currentUser = this.authService.currentUser;
    this.canEditUser = currentUser.role == Role.Admin || currentUser.role == Role.SuperAdmin;;

    this.columns = [
      {
        name: 'main.avatar', prop: 'avatar',
        cellTemplate: this.avatarTmp, cellClass: 'avatar', headerClass: 'avatar'
      },
      {
        name: 'main.name', prop: 'name', sortable: true,
        cellTemplate: this.nameTmp, cellClass: 'name', headerClass: 'name'
      },
      //{ name: 'main.email', prop: 'email', sortable: false, cellClass: 'email', headerClass: 'email' },
      {
        name: 'phone', prop: 'phone', sortable: false,
        cellTemplate: this.phoneTmp, minWidth: 100, cellClass: 'phone', headerClass: 'phone'
      },
      // {
      //   name: 'address', prop: 'address', cellTemplate: this.addressTmp
      // },
      { name: 'Role', prop: 'role', sortable: true, cellClass: 'role', headerClass: 'role' },
      { name: 'Gender', prop: 'gender', sortable: true, cellClass: 'gender', headerClass: 'gender' },
      { name: 'Balance', prop: 'balance', sortable: true, cellClass: 'balance', headerClass: 'balance' },
      {
        name: 'Status', prop: 'status',
        cellTemplate: this.statusTmp, cellClass: 'status', headerClass: 'status'
      },     
      {
        name: 'Action', cellTemplate: this.actionTmp, cellClass: 'action', headerClass: 'action'
      },
    ];

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

  editUser(user: any) {
    this.router.navigate([`/manager/edit-user/${user.id}`]);
  }

  onupdateStatus(row: any) {
    const message = row.isActive ? "Are you sure you want to active this user?" : "Are you sure you want to block this user?";
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto',
      disableClose: true,
      data: {
        message: message
      }
    });

    modalRef.afterClosed$.subscribe((ok) => {
      if (ok) {
        const body = {
          userId: row.id,
          status: row.isActive ? UserStatus.Active : UserStatus.Locked
        };

        this.userService
          .updateStatus(body)
          .subscribe(
            (data: any) => {
              this.loading = false;

              if (data.isSuccessed) {
                this.toastr.success("Update status successfully.");
              }
              else {
                this.toastr.error(data.message);
              }
              
            },
            (error: { message: string; }) => {
              this.loading = false;
              this.toastr.error(error.message);
            }
      );
      }
      else {
        row.isActive = !row.isActive;
        this.cd.detectChanges();
      }
    });
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
        this.userService.getUsers()
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

    this.userService
      .getUsers(this.page)
      .pipe(finalize(() => this.loading = false))
      .subscribe((pagedData: any) => {
        const response = pagedData.body.resultObj
        this.page = response;
        this.rows = response.items;
        this.cd.detectChanges();
      });
  }

  onSort($event: any) {
    this.oldSortProp = $event.sorts[0]?.prop;
    this.oldSortOrder = $event.sorts[0]?.dir;
    this.setPage({
      offset: 0,
      sortProp: this.oldSortProp,
      sortOrder: this.oldSortOrder
    })
  }


}
