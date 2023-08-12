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
import { Router } from '@angular/router';
import { TaskService } from 'src/app/core/services/task-service/task.service';
import { FinishTaskComponent } from '../finish-task/finish-task.component';

@Component({
  selector: 'fxt-my-task',
  templateUrl: './my-task.component.html',
  styleUrls: ['./my-task.component.scss']
})
export class MyTaskComponent implements OnInit {

  @ViewChild('statusTmp', { static: true })
  statusTmp: TemplateRef<any> | null = null;

  @ViewChild('avatarTmp', { static: true })
  avatarTmp: TemplateRef<any> | null = null;

  @ViewChild('fullNameTmp', { static: true })
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
  isMyOwnTasks = false;

  constructor(
    private router: Router,
    protected authService: AuthenticationService,
    protected modalService: ModalService,
    protected messageService: MessageService,
    protected userService: UserService,
    protected taskService: TaskService,
    protected translocoService: TranslocoService,
    protected cd: ChangeDetectorRef,
    private managerViewService: ManagerViewService
  ) {
   
  }

  ngOnInit() {
    const url = this.router.url;
    this.isMyPickedTasks = url.indexOf("my-picked-task") != -1 ;
    this.isMyOwnTasks = url.indexOf("my-own-task") != -1 ;

    this.columns = [
      {
        name: 'main.name', prop: 'name', sortable: true,
        cellTemplate: this.nameTmp, cellClass: 'column-name', headerClass: 'column-name'
      },
      // {
      //   name: 'Average Completion Time', prop: 'averageCompletionTime'       
      // },
      { name: 'Earning', prop: 'bidPerTaskCompletion', sortable: true },
      {
        name: 'Document', prop: 'document', sortable: false,
        cellTemplate: this.documentTmp, minWidth: 100, cellClass: 'column-chip', headerClass: 'column-chip'
      },
      {
        name: 'Link Youtube', prop: 'linkYouTube',
        cellTemplate: this.linkYouTube
      },
      { name: 'Duration On Page', prop: 'durationOnPage', sortable: true },
      { name: 'Status', prop: 'status', sortable: true },
      {
        name: 'Action',
        cellTemplate: this.actionTmp
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

  isFinishedTask(item: any) {
    return item.isFinished;
  }

  setPage(pageInfo: any, sortProp?: string, sortOrder?: string) {
    this.loading = true;

    this.page.pageNumber = pageInfo.offset;
    this.page.sortProp = pageInfo.sortProp || sortProp;
    this.page.sortOrder = pageInfo.sortOrder || sortOrder;

    const url = this.router.url;
    const isMyOwnTasks = url.indexOf("my-own-task") != -1 ;
    //const isMyPickedTasks = url.indexOf("my-picked-tas") != -1 ;

    if (this.isMyPickedTasks) {
      this.taskService
      .getMyPickedTasks(this.page)
      .pipe(finalize(() => this.loading = false))
      .subscribe((pagedData: any) => {
        const response = pagedData.body.resultObj
        this.page = response;
        this.rows = response.items;
        this.cd.detectChanges();
      });
    }
    else if (isMyOwnTasks) {
      this.taskService
      .getMyOwnTasks(this.page)
      .pipe(finalize(() => this.loading = false))
      .subscribe((pagedData: any) => {
        const response = pagedData.body.resultObj
        this.page = response;
        this.rows = response.items;
        this.cd.detectChanges();
      });
    }
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
    this.router.navigate([`manager/detail-task/${item.id}`], { queryParams: { isMyPickedTasks: this.isMyPickedTasks, isMyOwnTasks: this.isMyOwnTasks, isFinishedTask: item.isFinished } });
  }

  finishTask(row: any) {
    //const message = row.isActive ? "Are you sure you want to active this task?" : "Are you sure you want to inactive this task?";
    const modalRef = this.modalService.open(FinishTaskComponent, {
      width: '400px',
      disableClose: true,
      data: {
        //message: message
      }
    });

    modalRef.afterClosed$.subscribe((ok) => {
      if (ok) {
        
      }
      else {
        this.setPage({ offset: 0 });
      }
    });
  }

  viewUsersPickedTask(item: any) {
    this.router.navigate([`manager/users-picked-task/${item.id}`]);
  }
}
