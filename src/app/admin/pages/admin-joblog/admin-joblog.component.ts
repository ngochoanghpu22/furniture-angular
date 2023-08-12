import { Component, OnInit } from '@angular/core';
import { Company } from '@flex-team/core';
import { AdminCompanyViewService } from '../../services/admin-company-view.service';

@Component({
  selector: 'app-admin-joblog',
  templateUrl: './admin-joblog.component.html',
  styleUrls: ['./admin-joblog.component.scss'],
  providers: [AdminCompanyViewService]
})
export class AdminJobLogComponent implements OnInit {

  selectedCompany: Company | null;

  constructor(private adminCompanyViewService: AdminCompanyViewService) {

  }

  ngOnInit() {
    this.adminCompanyViewService.company$.subscribe(data => {
      this.selectedCompany = data;
    })
  }

}
