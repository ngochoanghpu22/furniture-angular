import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FxtAnimations } from '@design-system/core';
import { WeeklySearchChartDataPayload } from '@flex-team/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ManagerCalendarFilterService } from '../../services';

@Component({
  selector: 'fxt-manager-weekly-search-chart',
  templateUrl: './weekly-search-chart.component.html',
  styleUrls: ['./weekly-search-chart.component.scss'],
  animations: [FxtAnimations.fadeOut]
})
export class ManagerWeeklySearchChartComponent implements OnInit, OnDestroy {

  @Input() total: number;
  @Input() dayIndex: number;
  @Input() data: WeeklySearchChartDataPayload[] = [];

  @Output() barClicked = new EventEmitter<WeeklySearchChartDataPayload>();

  currentSort: string;

  private _destroyed: Subject<void> = new Subject<void>()

  constructor(private managerFilterService: ManagerCalendarFilterService) { }

  ngOnInit() {
    this.managerFilterService.sort$
      .pipe(takeUntil(this._destroyed))
      .subscribe(sortObj => {
        this.currentSort = ((sortObj.dayIndex == this.dayIndex) && sortObj.name) ? sortObj.name : null;
      })
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

}
