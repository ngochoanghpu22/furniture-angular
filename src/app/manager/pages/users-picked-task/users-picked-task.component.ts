
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ModalService } from '@design-system/core';
import { AuthenticationService, DirectoryCurrentUserDTO, ManagerViewService, MessageService, Page, SelectionItem } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { TableColumn } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalUserProfileComponent } from 'src/app/components';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { UserService } from 'src/app/core/services/user-service/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from 'src/app/core/services/task-service/task.service';
import { FinishTaskComponent } from '../finish-task/finish-task.component';

@Component({
  selector: 'fxt-users-picked-task',
  templateUrl: './users-picked-task.component.html',
  styleUrls: ['./users-picked-task.component.scss']
})
export class UsersPickedTaskComponent implements OnInit {

  @ViewChild('statusTmp', { static: true })
  statusTmp: TemplateRef<any> | null = null;

  @ViewChild('avatarTmp', { static: true })
  avatarTmp: TemplateRef<any> | null = null;

  @ViewChild('nameTmp', { static: true })
  nameTmp: TemplateRef<any> | null = null;

  @ViewChild('linkYouTubeTmp', { static: true })
  linkYouTube: TemplateRef<any> | null = null;

  @ViewChild('documentTmp', { static: true })
  documentTmp: TemplateRef<any> | null = null;

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

  isMyPickedTasks = false;
  isMyOwnTasks = true;
  taskId: any = null;


  constructor(
    private router: Router,
    protected authService: AuthenticationService,
    protected modalService: ModalService,
    protected messageService: MessageService,
    protected userService: UserService,
    protected taskService: TaskService,
    protected translocoService: TranslocoService,
    protected cd: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private managerViewService: ManagerViewService
  ) {
   
  }

  ngOnInit() {
    const url = this.router.url;
    this.taskId = parseInt(this.activatedRoute.snapshot.params.id) || null;

    this.columns = [
      {
        name: 'Task Name', sortable: false,
        cellTemplate: this.nameTmp, cellClass: 'column-name', headerClass: 'column-name'
      },    
      {
        name: 'ImplementedBy', prop: 'implementedBy', sortable: true,
        cellTemplate: this.documentTmp, minWidth: 100, cellClass: 'column-chip', headerClass: 'column-chip'
      },
      {
        name: 'Status', prop: 'status', sortable: true,
        cellTemplate: this.linkYouTube
      },
      { name: 'Picked Date', prop: 'pickedDate', sortable: true }
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
    .getUsersPickedTask(this.page, this.taskId)
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
    this.router.navigate([`manager/detail-task/${item.taskId}`], { queryParams: { isMyPickedTasks: this.isMyPickedTasks, isMyOwnTasks: this.isMyOwnTasks } });
  }
}
