import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { StaticDataService } from './static-data.service';
import { HierarchyLevel } from "./workloads/enums";
import { Location } from './workloads/Location';
import { Workload } from './workloads/Workload';

@Injectable()
export class LocationService extends BaseApiService {

  constructor(
    protected http: HttpClient,
    private staticDataService: StaticDataService
  ) {
    super(http);
  }

  public getLocations(onboardingToken: string = ''): Observable<Workload<Location[]>> {
    return this.http
      .post<Workload<Location[]>>(this.accessPointUrl + '/api/Location/Locations',
        {},
        { headers: { "onboarding": onboardingToken } });
  }

  public getActiveRootLocations(): Observable<Workload<Location[]>> {
    return this.http.get<Workload<Location[]>>(`${this.accessPointUrl}/api/Location/GetActiveRootLocations`);
  }

  public getLocationsBetweenDate(startDate: Date, endDate: Date, onboardingToken?: string): Observable<Workload<Location[]>> {
    const startIso = this.staticDataService.dateToUTCDate(startDate);
    const endIso = this.staticDataService.dateToUTCDate(endDate);

    const body: { startDate: string, endDate: string, onboardingToken?: string }
      = { startDate: startIso, endDate: endIso };
    if (onboardingToken) {
      body.onboardingToken = onboardingToken;
    }
    return this.http.post<Workload<Location[]>>(this.accessPointUrl + '/api/Location/LocationsBetweenDate', body);
  }

  public getLocationLoadBetweenDate(locationId: string, start: DateTime, end: DateTime): Observable<Workload<Location>> {
    const body: { startDate: DateTime, endDate: DateTime } = { startDate: start, endDate: end };
    return this.http.post<Workload<Location>>(this.accessPointUrl + `/api/Location/LocationLoadBetweenDate/${locationId}`, body);
  }

  public flattenLocation(location: Location, brotherCount: number = 0): Location[] {
    if (location.inOffice && location.hierarchyLevel === null && location.children.length > 0)
      return location.children.map(c => this.flattenLocation(c, location.children.length)).reduce((a, b) => a.concat(b), []);
    if (location.inOffice && location.hierarchyLevel === HierarchyLevel.Building && brotherCount <= 1)
      return location.children.map(c => this.flattenLocation(c, location.children.length)).reduce((a, b) => a.concat(b), []);
    if (location.inOffice && location.hierarchyLevel === HierarchyLevel.Floor && brotherCount <= 1)
      return location.children.map(c => this.flattenLocation(c, location.children.length)).reduce((a, b) => a.concat(b), []);

    return [location]
  }

  public flattenLocations(location: Location[]): Location[] {
    return location.map(c => this.flattenLocation(c)).reduce((a, b) => a.concat(b), []);
  }

  public flattenLocationsAndHideArchived(location: Location[]): Location[] {
    return this.hideArchived(location).map(c => this.flattenLocation(c)).reduce((a, b) => a.concat(b), []);
  }

  public hideArchived(location: Location[]): Location[] {
    return location.filter(l => l.archived === false)
  }

}
