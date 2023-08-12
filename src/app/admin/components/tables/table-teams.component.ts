import {
  ChangeDetectorRef,
  Component,
  ElementRef, Input, OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { AdminTypes, Company, Team } from '@flex-team/core';
import { AdminTeamViewService } from '../../services/admin-team-view.service';
import { FxtDatatableComponent } from '../datatable/datatable.component';
import { factoryProviders } from './factory-providers';

@Component({
  selector: 'fxt-admin-table-teams',
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
      (selected)="onSelect($event)"
    ></fxt-datatable>

    <ng-template #checkTmp let-row="row" let-value="value">
      <span *ngIf="value" style="color:#029c55;"><i class="fas fa-check"></i></span>
    </ng-template>

    <ng-template #visibilityTmp let-row="row" let-value="value">
      <span *ngIf="value == 'private'" title="private"
        ><i class="fas fa-eye-slash"></i
      ></span>
    </ng-template>

    <ng-template #ownerTmp let-row="row" let-value="value">
      <span>{{ row.ownerName }}</span>
    </ng-template> `,
  providers: factoryProviders(AdminTypes.Team),
})
export class AdminTableTeamsComponent implements OnInit {
  @ViewChild('checkTmp', { static: true })
  checkTmp: TemplateRef<any> | null = null;

  @ViewChild('visibilityTmp', { static: true })
  visibilityTmp: TemplateRef<any> | null = null;

  @ViewChild('ownerTmp', { static: true })
  ownerTmp: TemplateRef<any> | null = null;

  @ViewChild('table', { static: true }) fxtTable: FxtDatatableComponent;
  @ViewChild('inputFile', { static: true }) inputFileRef: ElementRef;

  type = AdminTypes.Team;
  columns: any[] = [];

  pathGet = 'GetTeams';
  pathUpdate = 'UpdateTeam';
  pathCreate = 'CreateTeam';
  pathDelete = 'DeleteTeam';
  companyId = '';

  @Input() set company(val: Company) {
    if (val) {
      this.pathGet = `GetTeamsOfCompany/company/${val.id}`;
      this.cd.detectChanges();
      this.refreshTable();
      this.companyId = val.id;
    }
  }

  constructor(private cd: ChangeDetectorRef, private adminTeamViewService: AdminTeamViewService) {}

  ngOnInit() {
    this.columns = [
      { name: 'Name', prop: 'name' },
      { name: 'Owner', prop: 'idOwner', cellTemplate: this.ownerTmp },
      { name: 'Description', prop: 'description' },
      {
        name: 'Visibility',
        prop: 'visibility',
        cellTemplate: this.visibilityTmp,
      },
      { name: 'Hierarchy', prop: 'isHierarchy', cellTemplate: this.checkTmp },
      { name: 'Prefered', prop: 'isPrefered', cellTemplate: this.checkTmp },
      { name: 'Social', prop: 'isSocial', cellTemplate: this.checkTmp },
      { name: 'Notice Period', prop: 'noticePeriod' },
    ];
  }

  private refreshTable() {
    this.fxtTable.setPage({ offset: 0 });
  }
  onSelect(team: Team){
    this.adminTeamViewService.team = team;
  }
}
