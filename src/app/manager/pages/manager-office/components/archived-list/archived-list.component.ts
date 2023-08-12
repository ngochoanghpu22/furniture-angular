import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ModalConfirmationComponent, ModalRef, ModalService } from '@design-system/core';
import {
  ArchivedOfficeDTO, AuthenticationService, HierarchyLevel,
  ManagerOfficeService, MessageService, Workload
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { ColumnMode, TableColumn } from '@swimlane/ngx-datatable';
import { Observable, Subject, Subscription } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'fxt-archived-list',
  templateUrl: './archived-list.component.html',
  styleUrls: ['./archived-list.component.scss']
})
export class ArchivedListComponent implements OnInit, OnDestroy {

  @ViewChild('dateTmp', { static: true })
  dateTmp: TemplateRef<any> | null = null;

  type: HierarchyLevel = HierarchyLevel.Office;
  subs = new Subscription();
  edited = false;
  types: string[] = [];

  items: ArchivedOfficeDTO[] = [];

  HierarchyLevelEnum = HierarchyLevel;
  companyId: string;

  ColumnMode = ColumnMode;
  loading = true;

  isInit = false;
  columns: TableColumn[];
  allColumns: TableColumn[];
  formatDateTime: string;

  private _destroyed = new Subject<void>();

  constructor(
    private managerOfficeService: ManagerOfficeService,
    private modalService: ModalService,
    private translocoService: TranslocoService,
    private messageService: MessageService,
    private modalRef: ModalRef,
    private authService: AuthenticationService
  ) {
    this.companyId = this.authService.currentUser.idCompany;
    this.columns = this.allColumns = [
      { name: 'main.office', prop: 'officeName', sortable: true },
      { name: 'main.floor', prop: 'floorName', sortable: true },
      { name: 'main.building', prop: 'buildingName', sortable: true }
    ];
    this.formatDateTime = this.authService.formatDateTime;
  }

  ngOnInit(): void {
    this.selectTab(HierarchyLevel.Office);
  }

  selectTab(type: HierarchyLevel) {
    this.type = type;
    this.getItems(type);
  }

  getItems(type: HierarchyLevel) {

    if (!this.isInit) {
      this.loading = true;
      this.isInit = true;
    }

    let action$: Observable<Workload<ArchivedOfficeDTO[]>>;
    switch (type) {
      case HierarchyLevel.Building:
        action$ = this.managerOfficeService.getArchivedBuildings(this.companyId);
        this.columns = this.allColumns.filter(x => x.prop != 'floorName' && x.prop != 'officeName');
        break;
      case HierarchyLevel.Floor:
        action$ = this.managerOfficeService.getArchivedFloors(this.companyId);
        this.columns = this.allColumns.filter(x => x.prop != 'officeName');
        break;
      default:
        action$ = this.managerOfficeService.getArchivedOffices(this.companyId);
        this.columns = this.allColumns
        break;
    }

    action$.pipe(finalize(() => this.loading = false),
      takeUntil(this._destroyed)).subscribe(resp => {
        this.items = resp.workload;
      });

  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  close() {
    this.modalRef.close({
      edited: this.edited,
      types: this.types
    });
  }

  restore(id: string) {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto',
      data: {
        message: this.translocoService.translate('archived_office.are_you_sure')
      }
    })

    modalRef.afterClosed$.pipe(takeUntil(this._destroyed)).subscribe((ok) => {
      if (ok) {

        let action$: Observable<Workload<any>>;
        switch (this.type) {
          case HierarchyLevel.Building:
            action$ = this.managerOfficeService.restoreBuilding(id);
            break;
          case HierarchyLevel.Floor:
            action$ = this.managerOfficeService.restoreFloor(id);
            break;
          default:
            action$ = this.managerOfficeService.restoreOffice(id);
            break;
        }

        action$.pipe(takeUntil(this._destroyed)).subscribe(r => {
          if (r.errorMessage === "") {
            this.messageService.success('archived_office.restore_success');
            this.getItems(this.type);
            return;
          }
          let errorMsm = this.translocoService.translate('manager.restore_fail');
          if (this.type === HierarchyLevel.Floor) {
            errorMsm = this.translocoService.translate('manager.restore_floor_fail', { name: r.errorMessage });
          }
          if (this.type === HierarchyLevel.Office) {
            errorMsm = this.translocoService.translate('manager.restore_office_fail', { name: r.errorMessage });
          }
          this.messageService.error(errorMsm);
        })

        this.edited = true;
      }
    });
  }

}
