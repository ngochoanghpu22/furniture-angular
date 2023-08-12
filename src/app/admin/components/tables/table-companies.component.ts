import { Component, OnInit } from '@angular/core';
import { AdminService, AdminTypes, Company, FileService } from '@flex-team/core';
import { DateTime } from 'luxon';
import { AdminCompanyViewService } from '../../services';
import { factoryProviders } from './factory-providers';

@Component({
  selector: 'fxt-admin-table-companies',
  template: `<fxt-datatable [columns]="columns" [type]="type"
  [pathGet]="pathGet" [pathUpdate]="pathUpdate" [pathCreate]="pathCreate"
  [pathDelete]="pathDelete"
  (selected)="onSelect($event)"></fxt-datatable>
 <button *ngIf="adminCompanyViewService.company" type="button" class="btn btn-warning ml-1 mt-3" (click)="getExcelUsersOnSite()">Get users on site</button>`,
  providers: factoryProviders(AdminTypes.Company)
})
export class AdminTableCompaniesComponent implements OnInit {

  type = AdminTypes.Company;
  columns = [
    { name: 'Name', prop: 'name' },
  ];

  pathGet = "GetCompanies";
  pathUpdate = "UpdateCompany";
  pathCreate = "CreateCompany";
  pathDelete = "DeleteCompany";

  constructor(
    public adminCompanyViewService: AdminCompanyViewService,
    private fileService: FileService,
    private adminService: AdminService) {
  }

  ngOnInit() {
  }

  onSelect(company: Company) {
    this.adminCompanyViewService.company = company;
  }

  getExcelUsersOnSite() {
    this.adminService.getExcelUsersOnSite(this.adminCompanyViewService.company.id, DateTime.now().plus({ days: -7 }), DateTime.now().plus({ days: 7 }))
      .subscribe(s => {
        this.fileService.downloadFile(s, "UserBySite.xlsx");
      });
  }

}
