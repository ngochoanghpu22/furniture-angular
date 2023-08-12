import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import {
  Location, LocationStatsDto, LocationStatsItemDto,
  LoginStatsDto, Workload
} from './workloads';

@Injectable()
export class ManagerStatsService extends BaseApiService {

  private name: string = "ManagerStats"

  private baseUrl = '';

  constructor(protected http: HttpClient) {
    super(http);
    this.baseUrl = `${this.accessPointUrl}/api/${this.name}`;
  }

  public getLocationStats(targetDate: DateTime) {
    return this.http
      .post<Workload<Location[]>>(this.baseUrl + `/GetLocationStats`, { targetDate })
      .pipe(map(resp => this.mapToLocationStats(resp.workload, targetDate)));
  }

  public getLoginStats(targetDate: DateTime) {
    return this.http
      .post<Workload<LoginStatsDto[]>>(this.baseUrl + `/getLoginStats`,
        {
          targetDate
        });
  }

  public getExcelMonthlyOfficeOccupancy(targetDate: DateTime): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/GetExcelMonthlyOfficeOccupancy`,
      {
        targetDate
      }, { responseType: 'blob' });
  }

  public getExcelMonthlyWorkforceDistribution(targetDate: DateTime): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/GetExcelMonthlyWorkforceDistribution`,
      {
        targetDate
      }, { responseType: 'blob' });
  }

  public getExcelMonthlyPersonalLogins(targetDate: DateTime): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/getExcelMonthlyPersonalLogins`,
      {
        targetDate
      }, { responseType: 'blob' });
  }

  private mapToLocationStats(items: Location[], targetDate: DateTime): LocationStatsDto[] {
    const list: LocationStatsDto[] = [];
    const daysInMonth = targetDate.daysInMonth;

    for (var dayIndex = 0; dayIndex < daysInMonth; dayIndex++) {
      const date = targetDate.plus({ days: dayIndex });

      const dto: LocationStatsDto =
      {
        date: date.toJSDate(),
        dayOfWeek: date.weekday,
        items: [],
        total: 0
      };

      let total = 0;

      items.forEach(loc => {
        const item: LocationStatsItemDto = new LocationStatsItemDto(loc, dayIndex);
        total += item.actualLoad[0];

        dto.items.push(item);
      })

      dto.total += total;

      list.push(dto);
    }

    return list;
  }

}
