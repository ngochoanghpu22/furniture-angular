import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, InjectionToken } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { StaticDataService } from './static-data.service';
import { Building, CheckDataConsistencyDTO, MeetingRoomDTO, Page, PagedData, Seat, Workload, AddSeatDTO } from './workloads';

export const PAGED_DATA_ROUTE_API_TOKEN = new InjectionToken<string>('PagedDataRouteApiToken');

@Injectable()
export class AdminService extends BaseApiService {

  protected name: string = "admin";

  protected baseUrl = '';

  constructor(
    protected http: HttpClient,
    private staticDataService: StaticDataService,
  ) {
    super(http);
    this.baseUrl = `${this.accessPointUrl}/api/${this.name}`;
  }

  public impersonate(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/impersonate`, { id });
  }
  public resendOnboardingLink(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/resendOnboardingLink`, { id });
  }
  public autofillMissingOnboardings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/autofillMissingOnboardings`, {});
  }


  public getPagedData(page: Page, childRoute: string): Observable<PagedData<any>> {
    return this.http.get<Workload<PagedData<any>>>(`${this.baseUrl}/${childRoute}?pageNumber=${page.pageNumber}&pageSize=${page.pageSize}&keyword=${page.keyword}`)
      .pipe(map(resp => this.mapPagedData(resp.workload)));
  }

  public update(model: any, childRoute: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${childRoute}`, model);
  }

  public create(model: any, childRoute: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${childRoute}`, model);
  }

  public delete(model: any, childRoute: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${childRoute}`, model);
  }

  public archive(model: any, childRoute: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${childRoute}`, model);
  }

  public restore(model: any, childRoute: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${childRoute}`, model);
  }

  public importUsersForCompany(companyId: string, file: File) {
    const formData: FormData = new FormData();
    formData.append('importFile', file, file.name);

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    headers.append('Accept', 'application/vnd.ms-excel');

    return this.http.post(`${this.baseUrl}/importUsersForCompany/company/${companyId}`, formData, {
      headers: headers
    })
  }

  public getExcelOnboardingsOfCompany(companyId: string): Observable<Blob> {
    return this.http.get(
      `${this.baseUrl}/GetExcelOnboardingsOfCompany/company/${companyId}`, { responseType: 'blob' }
    );
  }

  public getExcelUsersOnSite(companyId: string, startDate: DateTime, endDate: DateTime): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/GetExcelUsersOnSite`,
      {
        companyId: companyId,
        startDate: this.staticDataService.dateToUTCDate(startDate.toJSDate()),
        endDate: this.staticDataService.dateToUTCDate(endDate.toJSDate())
      }, { responseType: 'blob' });
  }

  public getAllUsersOfCompany(companyId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/GetAllUsersOfCompany/${companyId}`).pipe(
      map(({ workload }) => workload.map((x: any) => <any>{
        value: x.id,
        label: x.fullName
      })));
  }

  public addUsersToTeam(userIds: string[], teamId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/addUsersToTeam/team/${teamId}`, userIds);
  }

  /* Admin part */
  public weeklySlackReminder(): Observable<Workload<any>> {
    return this.http
      .get<Workload<any>>(`${this.baseUrl}/WeeklySlackReminder`, {});
  }

  public lastSeatBooking(): Observable<Workload<any>> {
    return this.http
      .get<Workload<any>>(`${this.baseUrl}/LastSeatBooking`, {});
  }

  public segmentLogged(): Observable<Workload<any>> {
    return this.http
      .get<Workload<any>>(`${this.baseUrl}/SegmentLogged`, {});
  }

  public segmentAdded(): Observable<Workload<any>> {
    return this.http
      .get<Workload<any>>(`${this.baseUrl}/SegmentAdded`, {});
  }

  public buildingSynchro(): Observable<Workload<any>> {
    return this.http
      .get<Workload<any>>(`${this.baseUrl}/BuildingSynchro`, {});
  }

  public segmentArchived(): Observable<Workload<any>> {
    return this.http
      .get<Workload<any>>(`${this.baseUrl}/SegmentArchived`, {});
  }

  

  public checkDataConsistency(): Observable<Workload<CheckDataConsistencyDTO>> {
    return this.http
      .get<Workload<any>>(`${this.baseUrl}/CheckDataConsistency`);
  }

  private mapPagedData(resp: PagedData<any>): PagedData<any> {
    const pagedData = new PagedData<any>();
    pagedData.page = new Page(resp);
    pagedData.data = resp.data;
    return pagedData;
  }

}

