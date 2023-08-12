import { Component, OnInit } from '@angular/core';
import { ManagerOrganizationBilling, ManagerOrganizationService } from '@flex-team/core';

@Component({
  selector: 'fxt-manager-billing',
  templateUrl: './manager-billing.component.html',
  styleUrls: ['./manager-billing.component.scss']
})
export class ManagerBillingComponent implements OnInit {

  public billings: ManagerOrganizationBilling[] = [];
  constructor(private service: ManagerOrganizationService) { }

  ngOnInit() {
    this.getBillings();
  }

  getBillings() {
    this.service.getBillings().subscribe(r => {
      this.billings = r.workload;
    })
  }

}
