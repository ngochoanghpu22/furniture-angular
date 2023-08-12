import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { DateTime } from 'luxon';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Day, PlanService, StaticDataService, Week } from '../services';

@Injectable()
export class PlanSelectDayResolver implements Resolve<boolean> {

  constructor(private staticDataService: StaticDataService, private planService: PlanService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    const targetJsDate = this.staticDataService.targetJSDate;
    let target = DateTime.fromJSDate(targetJsDate);

    const isWorkingDay = target.weekday !== 6 && target.weekday !== 7;

    if (!isWorkingDay) {
      target = target.plus({ days: 8 - target.weekday });
    }

    const targetData$ = [
      this.planService.getDayStatus(target.year, target.month, target.day),
      this.planService.getMonthStatus(target.year, target.month)
    ];

    return forkJoin(targetData$).pipe(switchMap(([targetDay, targetWeek]) => {
      const weekInMonth = Math.ceil((target.day - 1 - target.weekday) / 7);
      this.staticDataService.targetDay = targetDay.workload as Day[];
      this.staticDataService.targetWeek = (<Week[]>targetWeek.workload)[weekInMonth] as Week;
      this.staticDataService.targetDate = DateTime.fromJSDate(new Date((<any>targetDay.workload[0]).dayDate));
      return of(true);
    }));
  }


}
