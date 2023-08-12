import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ModalInformationComponent, ModalService } from '@design-system/core';
import { AdminService, AdminTypes, Company } from '@flex-team/core';
import { environment } from 'src/environments/environment';
import { FxtDatatableComponent } from '../datatable/datatable.component';
import { factoryProviders } from './factory-providers';

@Component({
  selector: 'fxt-admin-table-onboardings',
  template: `<fxt-datatable
      #table
      [columns]="columns"
      [type]="type"
      [pathGet]="pathGet"
      [canEdit]="false"
    ></fxt-datatable>
<button type="button" class="btn btn-warning ml-1 mt-3" (click)="getExcelOnboardingsOfCompany()">Get onboarding status</button>

    <ng-template #checkTmp let-row="row" let-value="value">
      <span *ngIf="value" style="color:#029c55;"
        ><i class="fas fa-check"></i
      ></span>
    </ng-template>

    <ng-template #locationTmp let-row="row" let-value="value">
      <span class="location" title="{{ value.address }}"
        ><i class="fas fa-{{ value.name }}"></i
      ></span>
    </ng-template>

    <ng-template #ownerTmp let-row="row" let-value="value">
      <span>{{ value.fullName }}</span>
    </ng-template>

    <ng-template #urlTmp let-row="row" let-value="value">
      <span class="c-pointer" (click)="showUrl($event, value)">{{
        value
      }}</span>
    </ng-template>`,
  providers: factoryProviders(AdminTypes.Onboarding),
})
export class AdminTableOnboardingComponent implements OnInit {
  @ViewChild('table', { static: true }) fxtTable: FxtDatatableComponent;

  @ViewChild('checkTmp', { static: true })
  checkTmp: TemplateRef<any> | null = null;

  @ViewChild('urlTmp', { static: true })
  urlTmp: TemplateRef<any> | null = null;

  @ViewChild('ownerTmp', { static: true })
  ownerTmp: TemplateRef<any> | null = null;

  @ViewChild('locationTmp', { static: true })
  locationTmp: TemplateRef<any> | null = null;

  type = AdminTypes.Onboarding;

  columns: any[] = [];

  pathGet = 'GetOnboardings';

  companyId = "";

  @Input() set company(val: Company) {
    if (val) {
      this.pathGet = `GetOnboardingsOfCompany/company/${val.id}`;
      this.cd.detectChanges();
      this.refreshTable();
      this.companyId = val.id
    }
  }

  constructor(
    private modalService: ModalService,
    private cd: ChangeDetectorRef,
    private adminService: AdminService) { }

  ngOnInit() {
    this.columns = [
      { name: 'Team', prop: 'team' },
      { name: 'Manager', prop: 'manager' },
      { name: 'Owner', prop: 'owner', cellTemplate: this.ownerTmp },
      { name: 'Monday', prop: 'monday', cellTemplate: this.locationTmp },
      { name: 'Tuesday', prop: 'tuesday', cellTemplate: this.locationTmp },
      { name: 'Wednesday', prop: 'wednesday', cellTemplate: this.locationTmp },
      { name: 'Thursday', prop: 'thursday', cellTemplate: this.locationTmp },
      { name: 'Friday', prop: 'friday', cellTemplate: this.locationTmp },
      { name: 'UrlToken', prop: 'urlToken', cellTemplate: this.urlTmp },
      { name: 'Done', prop: 'owner.isOnboarded', cellTemplate: this.checkTmp },
    ];
  }

  showUrl(event: any, token: string) {
    event.preventDefault();
    if (!token) {
      return;
    }

    const url = `${environment.accessPoint}/onboarding?OnboardingToken=${token}`;

    this.modalService.open(ModalInformationComponent, {
      width: 'auto',
      disableClose: true,
      data: {
        message: url,
      },
    });
  }

  private refreshTable() {
    this.fxtTable.setPage({ offset: 0 });
  }

  getExcelOnboardingsOfCompany() {
    this.adminService.getExcelOnboardingsOfCompany(this.companyId)
      .subscribe(s => {
        const blob = new Blob([s], { type: 'application/octet-stream' });
        const downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(blob);
        downloadLink.setAttribute('download', "Onboarding.xlsx");
        document.body.appendChild(document.createElement('a'));
        downloadLink.click();
      });
  }
}
