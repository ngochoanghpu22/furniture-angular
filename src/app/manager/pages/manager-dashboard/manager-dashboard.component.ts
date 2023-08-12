import { Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FxtAnimations } from '@design-system/core';
import { ManagerViewService } from '@flex-team/core';
import { DateTime } from 'luxon';
import { PlanSelectDayComponent } from 'src/app/plan-select-day';

@Component({
  selector: 'app-manager-dashboard',
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.scss'],
  animations: [FxtAnimations.fadeOut]
})
export class ManagerDashboardComponent implements OnInit, OnDestroy {

  @ViewChild(PlanSelectDayComponent) planRef: PlanSelectDayComponent;

  private _destroyed = new EventEmitter<void>();

  selectedDate: DateTime = DateTime.now();

  constructor(
    private managerViewService: ManagerViewService) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  onDateChanged(date: DateTime) {
    this.managerViewService.selectedDate = date;
  }

}
