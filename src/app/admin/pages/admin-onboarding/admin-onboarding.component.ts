import { Component, OnInit } from '@angular/core';
import { AdminService, Company } from '@flex-team/core';
import { AdminCompanyViewService } from '../../services/admin-company-view.service';

@Component({
  selector: 'app-admin-onboarding',
  templateUrl: './admin-onboarding.component.html',
  styleUrls: ['./admin-onboarding.component.scss'],
  providers: [AdminCompanyViewService],
})
export class AdminOnboardingComponent implements OnInit {
  selectedCompany: Company | null;

  constructor(
    private adminCompanyViewService: AdminCompanyViewService
  ) { }

  ngOnInit() {
    this.adminCompanyViewService.company$.subscribe((data) => {
      this.selectedCompany = data;
    });
  }
}
