import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ModalConfig, ModalRef } from '@design-system/core';
import {
  AuthProvider, ErrorCodeValues, ExternalOfficeDTO,
  LinkToExternalOfficeRequest, ManagerOfficeService, Office, Page
} from '@flex-team/core';
import { ColumnMode, DatatableComponent, SelectionType, TableColumn } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-modal-list-external-office',
  templateUrl: './modal-list-external-office.component.html',
  styleUrls: ['./modal-list-external-office.component.scss']
})
export class ModalListExternalOfficeComponent implements OnInit {

  @ViewChild(DatatableComponent) table: DatatableComponent;

  externalOffices: ExternalOfficeDTO[];
  rows: ExternalOfficeDTO[];

  authProvider: AuthProvider;
  authProviderLabel: string;
  office: Office;

  hasNoRightAdmin = false;

  page = new Page();
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  columns: TableColumn[];
  loading = false;

  selectedOffice: ExternalOfficeDTO;

  constructor(private config: ModalConfig,
    private modalRef: ModalRef,
    private cd: ChangeDetectorRef,
    private managerOfficeService: ManagerOfficeService
  ) {
    this.authProvider = this.config.data.authProvider;
    this.office = this.config.data.office;
    this.authProviderLabel = AuthProvider[this.authProvider];
  }

  ngOnInit() {
    this.columns = [
      { name: 'main.display_name', prop: 'displayName', sortable: true },
      { name: 'main.unique_id', prop: 'uniqueId', sortable: false },
    ];

    this.getExternalOffices();
  }

  selectOffice($event: any) {
    this.selectedOffice = $event.selected[0];
  }

  linkTo(externalOffice: ExternalOfficeDTO) {
    const req = {
      officeId: this.office.id,
      ...externalOffice
    } as LinkToExternalOfficeRequest;

    this.managerOfficeService.linkOfficeToExternalOffice(req)
      .subscribe(resp => {
        this.close(externalOffice);
      })
  }

  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();
    const temp = this.externalOffices.filter((d) => {
      return d.displayName.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
    this.table.offset = 0;
  }

  private getExternalOffices() {
    this.managerOfficeService.getExternalOffices(this.authProvider)
      .subscribe(resp => {
        if (!resp.errorCode) {
          this.externalOffices = resp.workload;
          this.rows = this.externalOffices;
          this.cd.detectChanges();
        } else {
          this.hasNoRightAdmin = resp.errorCode == ErrorCodeValues.USER_RIGHTS_NOT_ENOUGH;
          this.externalOffices = [];
        }
      })
  }

  close(res?: any) {
    this.modalRef.close(res);
  }

}
