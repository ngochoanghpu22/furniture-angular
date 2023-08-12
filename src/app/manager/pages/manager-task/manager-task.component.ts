import { ChangeDetectionStrategy, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import { AuthenticationService, DirectoryCurrentUserDTO, FileService, ManagerDirectoryService, ManagerOrganizationService, ManagerViewService, MessageService, Page, PagedData, SelectionItem } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { TableColumn } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalUserProfileComponent } from 'src/app/components';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { Role } from 'src/app/core/services/workloads/enums/role.enum';
import { TaskService } from 'src/app/core/services/task-service/task.service';
import { TaskStatus, UserStatus } from 'src/app/core/services/workloads/enums/user-status.enum';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fxt-manager-tasks',
  templateUrl: './manager-task.component.html',
  styleUrls: ['./manager-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagerTaskComponent {

  @ViewChild('statusTmp', { static: true })
  statusTmp: TemplateRef<any> | null = null;

  @ViewChild('avatarTmp', { static: true })
  avatarTmp: TemplateRef<any> | null = null;

  @ViewChild('nameTmp', { static: true })
  nameTmp: TemplateRef<any> | null = null;

  @ViewChild('linkYouTubeTmp', { static: true })
  linkYouTubeTmp: TemplateRef<any> | null = null;

  @ViewChild('documentTmp', { static: true })
  documentTmp: TemplateRef<any> | null = null;

  @ViewChild('actionTmp', { static: true })
  actionTmp: TemplateRef<any> | null = null;

  @ViewChild('createdByTmp', { static: true })
  createdByTmp: TemplateRef<any> | null = null;

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
  canEditTask = false;
  canCancelTask = false;

  isShowStatus = true;

  constructor(
    private router: Router,
    protected authService: AuthenticationService,
    protected modalService: ModalService,
    protected messageService: MessageService,
    protected taskService: TaskService,
    protected translocoService: TranslocoService,
    protected cd: ChangeDetectorRef,
    private toastr: ToastrService,
    private managerViewService: ManagerViewService
  ) {
   
  }

  ngOnInit() {

    const currentUser = this.authService.currentUser;
    this.canEditTask = currentUser.role == Role.Admin || currentUser.role == Role.SuperAdmin;;
    this.canCancelTask = currentUser.role == Role.Admin || currentUser.role == Role.SuperAdmin;;
    
    this.columns = this.getColumns();

    this.managerViewService.selection$.pipe(takeUntil(this._destroyed))
      .subscribe(selections => {
        this.selection = selections;
        this.setPage({ offset: 0 });
      })
  }

  getColumns() {
    const currentUser = this.authService.currentUser;
    const isAdmin = currentUser.role == Role.Admin;
    const isSuperAdmin = currentUser.role == Role.SuperAdmin;

    if (isAdmin || isSuperAdmin) {
      this.columns = [
        {
          name: 'main.name', prop: 'name', sortable: true,
          cellTemplate: this.nameTmp, cellClass: 'task-name', headerClass: 'task-name'
        },
        // {
        //   name: 'Average Completion Time', prop: 'averageCompletionTime', sortable: true,
        //   cellClass: 'average-completion-time', headerClass: 'average-completion-time'
        // },
        { name: 'Earning', prop: 'bidPerTaskCompletion', sortable: true, 
          cellClass: 'bid-per-task-completion', headerClass: 'bid-per-task-completion' 
        },
        {
          name: 'Document', prop: 'document',
          cellTemplate: this.documentTmp, minWidth: 100, cellClass: 'document', headerClass: 'document'
        },
        {
          name: 'Link Youtube', prop: 'linkYoutube',
          cellTemplate: this.linkYouTubeTmp, cellClass: 'linkYoutube', headerClass: 'linkYoutube'
        },
        { name: 'Duration On Page', prop: 'durationOnPage', sortable: true, 
          cellClass: 'durationOnPage', headerClass: 'durationOnPage'
        },
        { name: 'Status', prop: 'isActive', cellTemplate: this.statusTmp, sortable: true, 
          cellClass: 'isActive', headerClass: 'isActive' 
        },
        { name: 'Created By', prop: 'createdBy', sortable: true, cellTemplate: this.createdByTmp, 
          cellClass: 'createdBy', headerClass: 'createdBy' 
        },
        {
          name: 'Action', cellClass: 'action', headerClass: 'action',
          cellTemplate: this.actionTmp,
        },
      ];
    }
    else {
      this.columns = [
        {
          name: 'main.name', prop: 'name', sortable: true,
          cellTemplate: this.nameTmp, cellClass: 'task-name', headerClass: 'task-name'
        },
        // {
        //   name: 'Average Completion Time', prop: 'averageCompletionTime', sortable: true,
        //   cellClass: 'average-completion-time', headerClass: 'average-completion-time'
        // },
        { name: 'Earning', prop: 'bidPerTaskCompletion', sortable: true, 
          cellClass: 'bid-per-task-completion', headerClass: 'bid-per-task-completion'
        },
        {
          name: 'Document', prop: 'document',
          cellTemplate: this.documentTmp, minWidth: 100, cellClass: 'document', headerClass: 'document'
        },
        {
          name: 'Link Youtube', prop: 'linkYoutube',
          cellTemplate: this.linkYouTubeTmp, cellClass: 'linkYoutube', headerClass: 'linkYoutube'
        },
        { name: 'Duration On Page', prop: 'durationOnPage', sortable: true, 
          cellClass: 'durationOnPage', headerClass: 'durationOnPage' 
        },        
        {
          name: 'Action', cellClass: 'action', headerClass: 'action',
          cellTemplate: this.actionTmp,
        },
      ];
    }

    return this.columns;
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

  setPage(pageInfo: any, sortProp?: string, sortOrder?: string) {
    this.loading = true;

    this.page.pageNumber = pageInfo.offset;
    this.page.sortProp = pageInfo.sortProp || sortProp;
    this.page.sortOrder = pageInfo.sortOrder || sortOrder;

    this.taskService
      .getTasks(this.page)
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

  gotoTaskDetail(item: any) {
    this.router.navigate([`manager/detail-task/${item.id}`], { queryParams: { isMyOwnTasks: item.isOwner } });
  }

  editTask(item: any) {
    this.router.navigate([`manager/edit-task/${item.id}`]);
  }

  onupdateStatus(row: any) {
    const message = row.isActive ? "Are you sure you want to active this task?" : "Are you sure you want to inactive this task?";
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
          campaignId: row.id,
          status: row.isActive ? TaskStatus.Active : TaskStatus.InActive
        };

        this.taskService
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
}
