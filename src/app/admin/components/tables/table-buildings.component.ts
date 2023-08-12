import {
  ChangeDetectorRef,
  Component, EventEmitter, Input, OnInit, Output, ViewChild
} from '@angular/core';
import { AdminTypes, Building, Company } from '@flex-team/core';
import { FxtDatatableComponent } from '../datatable/datatable.component';
import { factoryProviders } from './factory-providers';

@Component({
  selector: 'fxt-admin-table-buildings',
  template: `<fxt-datatable
      #table
      [columns]="columns"
      [companyId]="companyId"
      [pathGet]="pathGet"
      [pathUpdate]="pathUpdate"
      [pathDelete]="pathDelete"
      [canImpersonate]="false"
      [pathCreate]="pathCreate"
      [type]="type"
      [canEdit]="false"
      [showAdd]="false"
      (selected)="onSelect($event)"
    ></fxt-datatable>
 `,
  providers: factoryProviders(AdminTypes.Building),
})
export class AdminTableBuildingsComponent implements OnInit {

  @ViewChild('table', { static: true }) fxtTable: FxtDatatableComponent;

  @Output() selected = new EventEmitter<Building>();

  type = AdminTypes.Building;
  columns: any[] = [];

  pathGet = 'GetTeams';
  pathUpdate = 'UpdateTeam';
  pathCreate = 'CreateTeam';
  pathDelete = 'DeleteTeam';
  companyId = '';

  @Input() set company(val: Company) {
    if (val) {
      this.pathGet = `GetBuildings/${val.id}`;
      this.cd.detectChanges();
      this.refreshTable();
      this.companyId = val.id;
    }
  }

  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.columns = [
      { name: 'Name', prop: 'name' },
      { name: 'Location', prop: 'location' }
    ];
  }

  private refreshTable() {
    this.fxtTable.setPage({ offset: 0 });
  }

  onSelect(building: Building) {
    this.selected.emit(building);
  }

}
