import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Location, LocationService, ManagerSort, WeeklySearchChartData, WeeklySearchChartDataPayload } from '@flex-team/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ManagerCalendarFilterService } from '../../services';

const MAX_LOCATIONS_CAN_BE_DISPLAYED = 4;

@Component({
  selector: 'fxt-manager-weekly-search-summary',
  templateUrl: './weekly-search-summary.component.html',
  styleUrls: ['./weekly-search-summary.component.scss']
})
export class ManagerWeeklySearchSummaryComponent implements OnInit, OnDestroy {

  @Input('data') data: WeeklySearchChartData[] = [];

  locations: Location[];

  constructor(
    private managerFilterService: ManagerCalendarFilterService,
    private locationService: LocationService
  ) { }

  showStates: { [key: string]: boolean };

  private _destroyed: Subject<void> = new Subject<void>()

  ngOnInit() {

    this.getActiveRootLocations();

    this.managerFilterService.weeklySummaryConfig$
      .pipe(takeUntil(this._destroyed))
      .subscribe(value => {
        this.showStates = value;
      });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  toggle(name: string) {
    this.showStates[name] = !this.showStates[name];
    this.managerFilterService.weeklySummaryConfig = this.showStates;
    this.updateVisibility(name);
  }

  onBarClicked(item: WeeklySearchChartDataPayload, index: number) {
    this.managerFilterService.sort = <ManagerSort>{
      name: item.name,
      dayIndex: index
    }
  }

  getActiveRootLocations() {
    this.locationService.getActiveRootLocations().subscribe(resp => {
      this.locations = resp.workload.slice(0, MAX_LOCATIONS_CAN_BE_DISPLAYED);
      this.locations.forEach(x => this.showStates[x.name] = true);
    })
  }

  private updateVisibility(name: string) {
    this.data.forEach(chart => {
      const found = chart.payload.find((x: WeeklySearchChartDataPayload) => x.name == name);
      if (found) {
        found.hidden = !this.showStates[name];
      }
    });
  }

}
