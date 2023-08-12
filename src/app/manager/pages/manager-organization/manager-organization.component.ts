import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '@flex-team/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-manager-organization',
  templateUrl: './manager-organization.component.html',
  styleUrls: ['./manager-organization.component.scss'],
})
export class ManagerOrganizationComponent implements OnInit, OnDestroy {

  companyId: string;
  loadingOffices = false;
  loadingFloors = false;

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private authService: AuthenticationService
  ) {
    this.companyId = this.authService.currentUser.idCompany;
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

}
