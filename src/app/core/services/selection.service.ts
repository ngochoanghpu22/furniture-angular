import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { StaticDataService } from './static-data.service';
import { Booking, SelectionGroups, SelectionItem, SelectionPayload, TeamType, Workload } from './workloads';

@Injectable()
export class SelectionService extends BaseApiService {

  constructor(
    protected http: HttpClient,
    private staticDataService: StaticDataService) {
    super(http);
  }

  public getPossibleSelection(onboardingToken: string, types: string[]): Observable<Workload<SelectionItem[]>> {
    return this.http
      .post<Workload<SelectionItem[]>>(this.accessPointUrl + '/api/Selection/GetPossibleSelection',
        { types: types },
        { headers: { "onboarding": onboardingToken } });
  }

  public getSelectionBooking(start: Date, end: Date, teamType: TeamType) {
    return this.http
      .post<Workload<Booking[]>>(this.accessPointUrl + '/api/Selection/GetSelectionBooking',
        { start: this.staticDataService.dateToUTCDate(start), end: this.staticDataService.dateToUTCDate(end), teamType: teamType });
  }

  public getCurrentSelection(onboardingToken: string = '') {
    return this.http
      .post<Workload<SelectionPayload>>(this.accessPointUrl + '/api/Selection/GetCurrentSelection',
        {},
        { headers: { "onboarding": onboardingToken } });
  }

  public deleteFromSelection(item: SelectionItem, onboardingToken: string = '') {
    const req = <SelectionPayload>{
      isAllCompany: item.group == SelectionGroups.AllCompany,
      isFavorites: item.group == SelectionGroups.Favorites,
      items: [item]
    }

    return this.http
      .post<Workload<SelectionPayload>>(this.accessPointUrl + '/api/Selection/DeleteFromSelection', req,
        { headers: { "onboarding": onboardingToken } });

  }

  public addToSelection(item: SelectionItem, onboardingToken: string = '') {

    const req = <SelectionPayload>{
      isAllCompany: item.group == SelectionGroups.AllCompany,
      isFavorites: item.group == SelectionGroups.Favorites,
      items: [item]
    }

    return this.http
      .post<Workload<SelectionPayload>>(this.accessPointUrl + '/api/Selection/AddToSelection', req,
        { headers: { "onboarding": onboardingToken } });
  }

  public addFavoritesToSelection() {
    return this.http
      .post<Workload<SelectionPayload>>(this.accessPointUrl + '/api/Selection/AddFavoritesToSelection',
        {});
  }

  public switchActivate(item: SelectionItem) {

    const req = <SelectionPayload>{
      items: [item]
    }

    return this.http
      .post<Workload<SelectionPayload>>(this.accessPointUrl + '/api/Selection/SwitchActivate', req);
  }

  public transformSelectionToFavoriteTeam(onboardingToken: string = '') {
    return this.http
      .post<Workload<boolean>>(this.accessPointUrl + '/api/Selection/TransformSelectionToFavoriteTeam',
        {},
        { headers: { "onboarding": onboardingToken } });
  }

  public getFavoritesSelection(): Observable<SelectionItem[]> {
    return this.http
      .get<Workload<SelectionItem[]>>(this.accessPointUrl + '/api/Selection/GetFavoritesSelection')
      .pipe(map(x => x.workload));
  }

  public getDefaultGroupsSelection(): Observable<SelectionItem[]> {
    return this.http
      .get<Workload<SelectionItem[]>>(this.accessPointUrl + '/api/Selection/GetDefaultGroupsSelection')
      .pipe(map(x => x.workload));
  }

}
