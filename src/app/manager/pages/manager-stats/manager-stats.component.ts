import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FileService,
  ManagerStatFilter,
  ManagerStatsService,
  StatViewTypes
} from '@flex-team/core';
import { DateTime, DurationInput } from 'luxon';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { ManagerStatsViewService } from './manager-stats-view.service';
import { ChartTools, InternalChartData } from './tools';

@Component({
  selector: 'app-manager-stats',
  templateUrl: './manager-stats.component.html',
  styleUrls: ['./manager-stats.component.scss'],
  providers: [ManagerStatsViewService],
})
export class ManagerStatsComponent implements OnInit, OnDestroy {
  StatsViewTypesEnum = StatViewTypes;

  tabs: string[] = [];
  filter: ManagerStatFilter;
  isDaily = false;
  forWorkforce = false;
  forPersonalLogin = false;
  targetDate: DateTime;

  periodText: string = '';
  chartData: InternalChartData = {
    datasets: [],
    labels: [],
  };

  loading$ = new BehaviorSubject<boolean>(false);

  private _destroyed = new Subject<void>();

  constructor(
    private managerStatsViewService: ManagerStatsViewService,
    private managerStatsService: ManagerStatsService,
    private fileService: FileService
  ) {
    Object.keys(this.StatsViewTypesEnum).forEach((itm) => {
      if (isNaN(+itm)) this.tabs.push(itm);
    });
  }

  ngOnInit() {
    this.managerStatsViewService.filters$
      .pipe(takeUntil(this._destroyed))
      .subscribe((filter) => {
        this.filter = filter;
        this.isDaily = this.managerStatsViewService.isDaily;
        this.forWorkforce = this.managerStatsViewService.forWorkforce;
        this.forPersonalLogin = this.managerStatsViewService.forPersonalLogin;
        this.periodText = filter.targetDate.toFormat('LLLL yyyy');
        this.targetDate = filter.targetDate;
        this.loadData(this.filter);
      });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  loadData(filter: ManagerStatFilter) {
    if (!this.managerStatsViewService.forPersonalLogin) {
      this.getLocationStats(filter.targetDate);
    } else {
      this.getLoginStats(filter.targetDate);
    }
  }

  selectTab(viewType: any) {
    if (this.filter.viewType != viewType)
      this.managerStatsViewService.viewType = viewType;
  }

  prev() {
    this.managerStatsViewService.targetDate = this.filter.targetDate.minus(
      this.getDurationInput()
    );
  }

  next() {
    this.managerStatsViewService.targetDate = this.filter.targetDate.plus(
      this.getDurationInput()
    );
  }

  exportXls() {
    switch (this.filter.viewType) {
      case StatViewTypes.MonthlyOfficesOccupancyRate:
        this.getExcelMonthlyOfficeOccupancy(this.filter.targetDate);
        break;
      case StatViewTypes.MonthlyWorkforceDistribution:
        this.getExcelMonthlyWorkforceDistribution(this.filter.targetDate);
        break;
      case StatViewTypes.MonthlyPersonalLogins:
        this.getExcelMonthlyPersonalLogins(this.filter.targetDate);
        break;
      default:
        break;
    }
  }

  private getExcelMonthlyOfficeOccupancy(targetDate: DateTime) {
    this.loading$.next(true);
    this.managerStatsService
      .getExcelMonthlyOfficeOccupancy(targetDate)
      .pipe(
        tap({
          next: () => this.loading$.next(false),
        })
      )
      .subscribe({
        next: (s) => {
          this.fileService.downloadFile(
            s,
            `MonthlyOfficeOccupancyRate_${this.periodText}.xlsx`
          );
        },
      });
  }

  private getExcelMonthlyWorkforceDistribution(targetDate: DateTime) {
    this.loading$.next(true);
    this.managerStatsService
      .getExcelMonthlyWorkforceDistribution(targetDate)
      .pipe(
        tap({
          next: () => this.loading$.next(false),
        })
      )
      .subscribe({
        next: (s) => {
          this.fileService.downloadFile(
            s,
            `MonthlyWorkforceDistribution_${this.periodText}.xlsx`
          );
        },
      });
  }

  private getExcelMonthlyPersonalLogins(targetDate: DateTime) {
    this.loading$.next(true);
    this.managerStatsService
      .getExcelMonthlyWorkforceDistribution(targetDate)
      .pipe(
        tap({
          next: () => this.loading$.next(false),
        })
      )
      .subscribe({
        next: (s) => {
          this.fileService.downloadFile(
            s,
            `MonthlyWorkforceDistribution_${this.periodText}.xlsx`
          );
        },
      });
  }

  private getLocationStats(targetDate: DateTime) {
    this.loading$.next(true);
    this.managerStatsService
      .getLocationStats(targetDate)
      .pipe(
        tap({
          next: () => this.loading$.next(false),
        })
      )
      .subscribe({
        next: (resp) => {
          this.chartData = ChartTools.factoryChartData(resp, this.filter);
        },
      });
  }

  private getLoginStats(targetDate: DateTime) {
    this.loading$.next(true);
    this.managerStatsService
      .getLoginStats(targetDate)
      .pipe(
        tap({
          next: () => this.loading$.next(false),
        })
      )
      .subscribe({
        next: (resp) => {
          this.chartData = ChartTools.factoryChartData(
            resp.workload,
            this.filter
          );
        },
      });
  }

  private getDurationInput(): DurationInput {
    if (this.managerStatsViewService.isMonthly) return { months: 1 };
    return { weeks: 1 };
  }
}
