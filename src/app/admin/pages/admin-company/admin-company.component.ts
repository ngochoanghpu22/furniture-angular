import { Component, OnInit } from '@angular/core';
import { Company } from '@flex-team/core';
import { AdminCompanyViewService } from '../../services/admin-company-view.service';

@Component({
  selector: 'app-admin-company',
  templateUrl: './admin-company.component.html',
  styleUrls: ['./admin-company.component.scss'],
  providers: [AdminCompanyViewService]
})
export class AdminCompanyComponent implements OnInit {

  selectedCompany: Company | null;

  constructor(private adminCompanyViewService: AdminCompanyViewService) {

  }

  ngOnInit() {
    this.adminCompanyViewService.company$.subscribe(data => {
      this.selectedCompany = data;
    })
  }

}
