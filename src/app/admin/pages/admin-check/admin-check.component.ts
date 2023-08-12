import { Component, OnInit } from '@angular/core';
import { AdminService, AuthenticationService, CheckDataConsistencyDTO } from '@flex-team/core';

@Component({
  selector: 'app-admin-check',
  templateUrl: './admin-check.component.html',
  styleUrls: ['./admin-check.component.scss']
})
export class AdminCheckComponent implements OnInit {

  data: CheckDataConsistencyDTO;
  formatDateTime: string;

  constructor(
    private adminService: AdminService,
    private authService: AuthenticationService
    ) {
      this.formatDateTime = this.authService.formatDateTime;
     }

  ngOnInit() {
  }

  checkDataConsistency() {
    this.data = null;
    this.adminService.checkDataConsistency().subscribe(resp => {
      this.data = resp.workload;
    })
  }

}
