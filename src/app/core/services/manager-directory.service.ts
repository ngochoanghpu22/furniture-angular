import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { DirectoryCreateUserDTO, DirectoryCurrentUserDTO, Page, PagedData, SelectionItem, Team, Workload } from './workloads';

@Injectable()
export class ManagerDirectoryService extends BaseApiService {

  private name: string = "ManagerDirectory"

  private baseUrl = '';

  constructor(protected http: HttpClient) {
    super(http);
    this.baseUrl = `${this.accessPointUrl}/api/${this.name}`;
  }

  public getPagedCurrentUsers(companyId: string, page: Page, selections: SelectionItem[]): Observable<PagedData<DirectoryCurrentUserDTO>> {
    let url = `${this.baseUrl}/GetPagedCurrentUsers/company/${companyId}?pageNumber=${page.pageNumber}&pageSize=${page.pageSize}`;

    if (page.sortProp) {
      url = url + `&sortProp=${page.sortProp}&sortOrder=${page.sortOrder}`;
    }

    return this.http.post<Workload<PagedData<DirectoryCurrentUserDTO>>>(url, {
      selection: selections
    }).pipe(map(resp => this.mapPagedData(resp.workload)));
  }

  public getPagedArchivedUsers(companyId: string, page: Page, selections: SelectionItem[]): Observable<PagedData<any>> {
    let url = `${this.baseUrl}/GetPagedArchivedUsers/company/${companyId}?pageNumber=${page.pageNumber}&pageSize=${page.pageSize}`;

    if (page.sortProp) {
      url = url + `&sortProp=${page.sortProp}&sortOrder=${page.sortOrder}`;
    }

    return this.http.post<Workload<PagedData<any>>>(url, {
      selection: selections
    }).pipe(map(resp => this.mapPagedData(resp.workload)));
  }

  public getPagedPendingUsers(companyId: string, page: Page, selections: SelectionItem[]): Observable<PagedData<any>> {
    let url = `${this.baseUrl}/GetPagedPendingUsers/company/${companyId}?pageNumber=${page.pageNumber}&pageSize=${page.pageSize}`;

    if (page.sortProp) {
      url = url + `&sortProp=${page.sortProp}&sortOrder=${page.sortOrder}`;
    }

    return this.http.post<Workload<PagedData<any>>>(url, {
      selection: selections
    }).pipe(map(resp => this.mapPagedData(resp.workload)));
  }


  public getOnBoardingLinkNotSent(companyId: string, page: Page, selections: SelectionItem[]): Observable<PagedData<any>> {
    let url = `${this.baseUrl}/GetOnBoardingLinkNotSent/company/${companyId}?pageNumber=${page.pageNumber}&pageSize=${page.pageSize}`;

    if (page.sortProp) {
      url = url + `&sortProp=${page.sortProp}&sortOrder=${page.sortOrder}`;
    }

    return this.http.post<Workload<PagedData<any>>>(url, {
      selection: selections
    }).pipe(map(resp => this.mapPagedData(resp.workload)));
  }

  public removePendingUser(companyId: string, userId: string) {
    return this.http.delete(`${this.baseUrl}/removePendingUser/company/${companyId}/user/${userId}`);
  }

  public resendOnboardingLink(userId: string) {
    return this.http.post(`${this.baseUrl}/ResendOnboardingLink/user/${userId}`, {});
  }

  public archiveUserFromCompany(companyId: string, userId: string) {
    return this.http.post(`${this.baseUrl}/ArchiveUserFromCompany/company/${companyId}/user/${userId}`, {});
  }

  public restoreUser(companyId: string, userId: string) {
    return this.http.post(`${this.baseUrl}/RestoreUser/company/${companyId}/user/${userId}`, {});
  }

  public getExcelUsers(companyId: string): Observable<Blob> {
    return this.http.get(this.baseUrl + `/GetExcelUsers/company/${companyId}`, { responseType: 'blob' });
  }

  public getHierarchyTeamsOfCompany(companyId: string): Observable<Workload<Team[]>> {
    return this.http.get<Workload<Team[]>>(`${this.baseUrl}/GetHierarchyTeamsOfCompany/company/${companyId}`);
  }

  public createOrEditUser(dto: DirectoryCreateUserDTO) {
    return this.http.post(`${this.baseUrl}/CreateOrEditUser`, dto);
  }

  private mapPagedData(resp: PagedData<any>): PagedData<any> {
    const pagedData = new PagedData<any>();
    pagedData.page = new Page(resp);
    pagedData.data = resp.data;
    return pagedData;
  }

  public addUsersViaExcelSheet(uploadFiles: FileList, companyId: any, isInvitedByEmail: boolean): Observable<any> {
    const headers = new HttpHeaders();
    let myFormData: FormData = new FormData();
    myFormData.append('file', uploadFiles.item(0), uploadFiles.item(0).name);
    myFormData.append("companyId", companyId);
    myFormData.append("sendOnboarding", isInvitedByEmail ? "true" : "false");

    return this.http.post(this.baseUrl + '/AddUsersViaExcelSheet', myFormData, {
      headers: headers
    });
  }

}
