import {
  ChangeDetectorRef,
  Component, EventEmitter, Input, OnInit, Output, ViewChild
} from '@angular/core';
import { AdminTypes, Building, Floor } from '@flex-team/core';
import { FxtDatatableComponent } from '../datatable/datatable.component';
import { factoryProviders } from './factory-providers';

@Component({
  selector: 'fxt-admin-table-floors',
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
  providers: factoryProviders(AdminTypes.Floor),
})
export class AdminTableFloorsComponent implements OnInit {

  @ViewChild('table', { static: true }) fxtTable: FxtDatatableComponent;
  @Output() selected = new EventEmitter<Floor>();

  type = AdminTypes.Floor;
  columns: any[] = [];

  pathGet = '';
  pathUpdate = '';
  pathCreate = '';
  pathDelete = '';
  companyId = '';
  buildingId = '';

  @Input() set building(val: Building) {
    if (val) {
      this.pathGet = `GetFloorsOfBuilding/building/${val.id}`;
      this.buildingId = val.id;
      this.cd.detectChanges();
      this.refreshTable();
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

  onSelect(floor: Floor) {
    this.selected.emit(floor);
  }

}
