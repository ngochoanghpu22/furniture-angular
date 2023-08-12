import { Injectable } from '@angular/core';
import { ManagerStatFilter, StatViewTypes } from '@flex-team/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ManagerStatsViewService {

  get filter(): ManagerStatFilter {
    return this._filtersSubject.value;
  }

  set filter(val: ManagerStatFilter) {
    this._filtersSubject.next(val);
  }

  private _filtersSubject: BehaviorSubject<ManagerStatFilter> = new BehaviorSubject(<ManagerStatFilter>{
    viewType: StatViewTypes.MonthlyOfficesOccupancyRate,
    targetDate: DateTime.now().set({ day: 1 }),
  });
  public filters$: Observable<ManagerStatFilter>;

  constructor() {
    this.filters$ = this._filtersSubject.asObservable();
  }

  set viewType(viewType: StatViewTypes) {
    const current = this.filter;
    current.viewType = viewType;
    this.filter = current;
  }

  set targetDate(date: DateTime) {
    const current = this.filter;
    current.targetDate = date;
    this.filter = current;
  }

  get isMonthly(): boolean {
    const tabMonthly = [
      StatViewTypes.MonthlyOfficesOccupancyRate,
      StatViewTypes.MonthlyPersonalLogins,
      StatViewTypes.MonthlyWorkforceDistribution
    ];
    return tabMonthly.indexOf(this.filter.viewType) >= 0;
  }

  get isDaily(): boolean {
    const tabDaily = [
      StatViewTypes.DailyAverageOfficeOccupancy,
      StatViewTypes.DailyAverageWorkforceDistribution,
      StatViewTypes.DailyAveragePersonalLogins
    ];
    return tabDaily.indexOf(this.filter.viewType) >= 0;
  }


  get forWorkforce(): boolean {
    const tab = [
      StatViewTypes.MonthlyWorkforceDistribution,
      StatViewTypes.DailyAverageWorkforceDistribution,
    ];
    return tab.indexOf(this.filter.viewType) >= 0;
  }

  get forPersonalLogin(): boolean {
    const tab = [
      StatViewTypes.MonthlyPersonalLogins,
      StatViewTypes.DailyAveragePersonalLogins,
    ];
    return tab.indexOf(this.filter.viewType) >= 0;
  }

}
