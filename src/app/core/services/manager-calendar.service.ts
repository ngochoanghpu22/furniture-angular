import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { BaseApiService } from './base-api.service';
import { StaticDataService } from './static-data.service';
import { Day, ManagerFilter, ManagerSearchData, ManagerTeamData, Workload } from './workloads';
import { Observable } from 'rxjs';

@Injectable()
export class ManagerCalendarService extends BaseApiService {

  private name: string = "ManagerCalendar"

  private baseUrl = '';

  constructor(
    protected http: HttpClient,
    private staticDataService: StaticDataService
  ) {
    super(http);
    this.baseUrl = `${this.accessPointUrl}/api/${this.name}`;
  }


  public getLocations(filter: ManagerFilter) {
    return this.http
      .post<Workload<ManagerTeamData[]>>(this.baseUrl + `/GetLocations`,
        {
          start: this.staticDataService.dateToUTCDate(filter.start.toJSDate()),
          end: this.staticDataService.dateToUTCDate(filter.end.toJSDate()),
          selection: filter.selection
        });
  }

  public getLocationsWholeCompany(filter: ManagerFilter) {
    return this.http
      .post<Workload<ManagerTeamData[]>>(this.baseUrl + `/GetLocationsWholeCompany`,
        {
          start: this.staticDataService.dateToUTCDate(filter.start.toJSDate()),
          end: this.staticDataService.dateToUTCDate(filter.end.toJSDate()),
          selection: []
        });
  }

  public getLocationsForFavorites(filter: ManagerFilter) {
    return this.http
      .post<Workload<ManagerTeamData[]>>(this.baseUrl + `/getLocationsForFavorites`,
        {
          start: this.staticDataService.dateToUTCDate(filter.start.toJSDate()),
          end: this.staticDataService.dateToUTCDate(filter.end.toJSDate()),
          selection: []
        });
  }

  public search(searchTerm: string) {
    searchTerm = encodeURIComponent(searchTerm);
    return this.http
      .post<Workload<ManagerSearchData>>(this.baseUrl + `/search?pattern=${searchTerm}`, {});
  }

  public confirm(userId: string, start: DateTime, end: DateTime): Observable<Workload<Day[][]>> {
    return this.http
      .post<Workload<Day[][]>>(this.baseUrl + `/confirm/${userId}`, {
        startDate: start.toISO(),
        endDate: end.toISO()
      });
  }

}
