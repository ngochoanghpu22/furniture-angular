import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { ModalAddEditComponent, ModalConfirmationComponent, ModalService } from '@design-system/core';
import { AdminTypes, MessageService, Page, PagedData } from '@flex-team/core';
import { FormlyFieldConfig } from '@ngx-formly/core';
import {
  ColumnMode,
  DatatableComponent,
  SelectionType
} from '@swimlane/ngx-datatable';
import { DatatableDataProvider } from '../../services';
import {
  factoryFormlyFields,
  factoryRawModel
} from '../tables/factory-formly-fields';

@Component({
  selector: 'fxt-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
})
export class FxtDatatableComponent implements OnInit, OnChanges {
  @Input() columns: any[];
  @Input() type: AdminTypes;

  @Input() pathGet: string;
  @Input() pathCreate: string;
  @Input() pathUpdate: string;
  @Input() pathDelete: string;
  @Input() pathArchive: string;
  @Input() pathRestore: string;
  @Input() canImpersonate: boolean = false;
  @Input() canEdit: boolean = true;
  @Input() showAdd: boolean = true;
  @Input() companyId: string = '';

  @Output() selected: EventEmitter<any> = new EventEmitter<any>();
  @Output() impersonated: EventEmitter<any> = new EventEmitter<any>();
  @Output() resendOnboardingLink: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(DatatableComponent) table: DatatableComponent;

  filteredRows = new Array<any>();

  page = new Page();
  rows = new Array<any>();
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  fields: FormlyFieldConfig[];
  rawModel: any;

  constructor(
    private dataProvider: DatatableDataProvider,
    private modalService: ModalService,
    private messageService: MessageService,
  ) {
    this.page.pageNumber = 1;
    this.page.pageSize = 10;
  }

  ngOnInit() {
    this.setPage({ offset: 0 });
    this.fields = factoryFormlyFields(this.type);
    this.rawModel = factoryRawModel(this.type);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { companyId } = changes;

    if (companyId && companyId.currentValue && companyId.currentValue !== companyId.previousValue) {
      if (this.type == AdminTypes.Team) {
        const fieldOwner = this.fields.find((x) => x.key == 'idOwner');
        if (fieldOwner && fieldOwner.templateOptions) {
          fieldOwner.templateOptions.options = this.dataProvider.getAllUsersOfCompany(companyId.currentValue);
        }
      }
    }

  }

  setPage(pageInfo: any) {
    this.page.pageNumber = pageInfo.offset;
    this.dataProvider
      .getPagedData(this.page, this.pathGet)
      .subscribe((pagedData: PagedData<any>) => {
        this.page = pagedData.page;
        this.rows = pagedData.data;
        this.filteredRows = [...pagedData.data];
      });
  }

  updateFilter(event: any) {
    const val = event.target.value.toLowerCase().trim();
    this.page.pageNumber = 1;
    this.page.pageSize = 10;
    this.page.keyword = val;
    this.setPage({ offset: 0 });
  }

  onSelect(row: any) {
    this.selected.emit(row);
  }

  impersonate(row: any) {
    this.impersonated.emit(row);
  }

  resendOnboarding(row: any) {
    this.resendOnboardingLink.emit(row);
  }

  edit(row: any) {
    this.openModalAddEdit(row, true);
  }

  remove(row: any) {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto',
      disableClose: true,
    });

    modalRef.afterClosed$.subscribe((ok) => {
      if (ok) {
        this.delete(row);
      }
    });
  }

  archive(row: any) {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto',
      disableClose: true,
    });

    modalRef.afterClosed$.subscribe((ok) => {
      if (ok) {
        row.isArchived = true;
        this.archiveUser(row);
      }
    });
  }

  unarchive(row: any) {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto',
      disableClose: true,
    });

    modalRef.afterClosed$.subscribe((ok) => {
      if (ok) {
        row.isArchived = false;
        this.restoreUser(row);
      }
    });
  }

  add() {
    this.openModalAddEdit(this.rawModel, false);
  }

  openModalAddEdit(model: any, isEdit: boolean) {

    if (this.type == AdminTypes.User) {
      const role: any = {};
      model.roleSerialized.split(',').forEach((key: string) => {
        role[key] = true;
      });
      model.role = role;
    }

    if (this.type == AdminTypes.Team) {
      model.isWorking = !model.isSocial && !model.isHierarchy
    }

    const modalRef = this.modalService.open(ModalAddEditComponent, {
      width: 'auto',
      disableClose: true,
      data: {
        isEdit: isEdit,
        model: model,
        fields: this.fields,
      },
    });
    modalRef.afterClosed$.subscribe((resp) => {
      if (resp && resp.model) {
        const markedUpModel = this.markupModelBeforeSave(resp.model);
        this.save(markedUpModel, isEdit);
      }
    });
  }

  private markupModelBeforeSave(model: any) {
    if (this.type == AdminTypes.User) {
      if (model.role) {
        const keys = Object.keys(model.role).filter(x => model.role[x]);
        model.roleSerialized = keys.join(',');
      }
    }
    return model;
  }

  private save(model: any, isEdit: boolean) {
    const action = isEdit ? this.dataProvider.update : this.dataProvider.create;
    const path = isEdit ? this.pathUpdate : this.pathCreate;
    action.call(this.dataProvider, model, path).subscribe((data) => {
      if (isEdit) {
        const index = this.rows.findIndex((x) => x.id == model.id);
        this.rows[index] = model;
      } else {
        this.rows.push(data.workload);
      }
      setTimeout(() => {
        this.rows = [].concat(...this.rows);
        this.setPage({ offset: 0 });
      });
      this._notify(data);
    });
  }

  private delete(model: any) {
    this.dataProvider.delete(model, this.pathDelete).subscribe((data) => {
      if (data.statusCode != 409) {
        this.rows = this.rows.filter((x) => x.id != model.id);
        this.rows = [...this.rows];
      }
      this._notify(data);
    });
  }

  private archiveUser(model: any) {
    this.dataProvider.archive(model, this.pathArchive).subscribe((data) => {
      if (data.statusCode != 409) {
        this.rows = this.rows.filter((x) => x.id != model.id);
        this.rows = [...this.rows];
      }
      this._notify(data);
    });
  }

  private restoreUser(model: any) {
    this.dataProvider.restore(model, this.pathRestore).subscribe((data) => {
      if (data.statusCode != 409) {
        this.rows = this.rows.filter((x) => x.id != model.id);
        this.rows = [...this.rows];
      }
      this._notify(data);
    });
  }

  private _notify(data: any) {
    if (!data.statusCode || data.statusCode == 200) {
      this.messageService.success('notifications.your_changes_updated')
    } else {
      this.messageService.error('notifications.an_error_occurred')
    }
  }
}
