import { Component, OnInit } from '@angular/core';
import { Company, Team } from '@flex-team/core';
import { AdminCompanyViewService } from '../../services/admin-company-view.service';
import { AdminTeamViewService } from '../../services/admin-team-view.service';

@Component({
  selector: 'app-admin-team',
  templateUrl: './admin-team.component.html',
  styleUrls: ['./admin-team.component.scss'],
  providers: [AdminCompanyViewService]
})
export class AdminTeamComponent implements OnInit {

  selectedCompany: Company | null;
  selectedTeam: Team | null;

  constructor(
    private adminCompanyViewService: AdminCompanyViewService,
    private adminTeamViewService: AdminTeamViewService,
  ) {

  }

  ngOnInit() {
    this.adminCompanyViewService.company$.subscribe(data => {
      this.selectedCompany = data;
    })
    this.adminTeamViewService.team$.subscribe(data => {
      this.selectedTeam = data;
    })
  }

}
