import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthenticationResult } from '@azure/msal-browser';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { BaseApiService } from './base-api.service';
import {
  AddEditWorkingPolicyDTO,
  ConfigurationType,
  Guid_Empty,
  IMetadataTemplate,
  ManagerOrganizationBilling,
  ManagerOrganizationIntegration, User, WorkingPolicy, WorkingStatus, Workload
} from './workloads';
import { OrganizationType } from './workloads/enums/OrganizationType.enum';

@Injectable()
export class ManagerOrganizationService extends BaseApiService {

  private name: string = "ManagerOrganization";
  private baseUrl = '';

  constructor(protected http: HttpClient,
    private authService: AuthenticationService) {
    super(http);
    this.baseUrl = `${this.accessPointUrl}/api/${this.name}`;
  }

  public updateIntegration(data: ManagerOrganizationIntegration): Observable<Workload<ManagerOrganizationIntegration>> {
    return this.http
      .get<Workload<ManagerOrganizationIntegration>>(this.accessPointUrl + '/api/Profile/GetFavoriteColleagues', {}).pipe(
        map(r => {
          const result: Workload<ManagerOrganizationIntegration> = new Workload();
          result.workload = data;
          return result;
        })
      );
  }

  public getIntegrations(): Observable<Workload<ManagerOrganizationIntegration[]>> {
    const billings: ManagerOrganizationIntegration[] = [
      { id: '1', configurationType: ConfigurationType.IsSlackEnabled, name: 'Slack', isLocked: false, isActive: this.authService.isSlackEnabled, icon: 'slack.png', type: OrganizationType.CommunicationTools },
      { id: '2', configurationType: ConfigurationType.IsTeamsEnabled, name: 'MS Teams', isLocked: false, isActive: this.authService.isTeamsEnabled, icon: 'teams.png', type: OrganizationType.CommunicationTools },
      { id: '3', configurationType: ConfigurationType.IsBambooHREnabled, name: 'Bamboo HR', isLocked: true, isActive: this.authService.isBambooHREnabled, icon: 'bamboo.png', type: OrganizationType.HRIS },
      { id: '4', configurationType: ConfigurationType.IsPayFitEnabled, name: 'Pay fit', isLocked: true, isActive: this.authService.isPayFitEnabled, icon: 'payfit.png', type: OrganizationType.HRIS },
      { id: '5', configurationType: ConfigurationType.IsLuccaEnabled, name: 'Lucca', isLocked: true, isActive: this.authService.isLuccaEnabled, icon: 'lucca.jpg', type: OrganizationType.HRIS },
      { id: '6', configurationType: ConfigurationType.IsWorkDayEnabled, name: 'Work Day', isLocked: true, isActive: this.authService.isWorkDayEnabled, icon: 'workday.jpg', type: OrganizationType.HRIS },
      { id: '7', configurationType: ConfigurationType.IsCegedimSRHEnabled, name: 'Cegedim SRH', isLocked: true, isActive: this.authService.isCegedimSRHEnabled, icon: 'srh.png', type: OrganizationType.HRIS },
      { id: '8', configurationType: ConfigurationType.IsSuccessFactorEnabled, name: 'Success Factor', isLocked: true, isActive: this.authService.isSuccessFactorEnabled, icon: 'successfactor.jpg', type: OrganizationType.HRIS },
    ];
    const result: Workload<ManagerOrganizationIntegration[]> = new Workload();
    result.workload = billings;
    return of(result);
  }

  public getHalfDayConfiguration(): Observable<Workload<ManagerOrganizationIntegration[]>> {
    const halfDayConfig: ManagerOrganizationIntegration[] = [
      {
        id: '1', configurationType: ConfigurationType.IsHalfDaysEnabled,
        name: 'Is Half Day Enabled', isLocked: true,
        isActive: this.authService.isHalfDaysEnabled,
        icon: '', type: OrganizationType.CommunicationTools
      },
    ];
    const result: Workload<ManagerOrganizationIntegration[]> = new Workload();
    result.workload = halfDayConfig;
    return of(result);
  }

  public getBillings(): Observable<Workload<ManagerOrganizationBilling[]>> {
    const billings: ManagerOrganizationBilling[] = [
      { id: '1', month: 'December 2020', activeUsers: 75, paid: '$300.00' },
      { id: '2', month: 'January 2021', activeUsers: 75, paid: '$300.00' },
      { id: '3', month: 'February 2021', activeUsers: 75, paid: '$300.00' },
      { id: '4', month: 'March 2021', activeUsers: 75, paid: '$300.00' },
    ];
    const result: Workload<ManagerOrganizationBilling[]> = new Workload();
    result.workload = billings;
    return of(result);
  }

  /** Working policy */

  public getWorkingPolicies(): Observable<Workload<AddEditWorkingPolicyDTO[]>> {
    return this.http.get<any>(this.baseUrl + `/GetWorkingPolicies`);
  }

  public addOrEditWorkingPolicy(dto: AddEditWorkingPolicyDTO): Observable<Workload<any>> {
    if (!dto.id) dto.id = Guid_Empty;
    return this.http
      .post<Workload<any>>(this.baseUrl + '/AddOrEditWorkingPolicy', dto);
  }

  public getManagersInCompany(companyId: string): Observable<Workload<User[]>> {
    return this.http.get<Workload<User[]>>(`${this.baseUrl}/GetManagersInCompany/${companyId}`);
  }

  public deleteWorkingPolicy(id: string): Observable<Workload<WorkingPolicy>> {
    return this.http
      .post<Workload<WorkingPolicy>>(this.baseUrl + `/ArchiveWorkingPolicy/${id}`, {});
  }

  /** Working status */

  public getWorkingStatus(companyId: string): Observable<Workload<WorkingStatus[]>> {
    return this.http.get<Workload<WorkingStatus[]>>(`${this.baseUrl}/GetEditLocations/${companyId}`);
  }

  public addOrEditWorkingStatus(workingStatus: WorkingStatus): Observable<Workload<WorkingStatus>> {
    if (!workingStatus.id) workingStatus.id = Guid_Empty;
    return this.http
      .post<any>(this.baseUrl + '/AddOrEditLocations', {
        id: workingStatus.id,
        name: workingStatus.name,
        address: workingStatus.address,
        inOffice: workingStatus.inOffice,
        isRemoteWork: workingStatus.isRemoteWork,
        archived: workingStatus.archived,
        color: workingStatus.color,
      });
  }



  public deleteWorkingStatus(id: string, companyId: string): Observable<Workload<WorkingStatus>> {
    return this.http
      .post<Workload<WorkingStatus>>(`${this.baseUrl}/DeleteEditLocations/${id}/${companyId}`, {});
  }

  public reorderWorkingStatus(dto: any): Observable<any> {
    return this.http.post<Workload<any>>(`${this.baseUrl}/ReorderWorkingStatus`, dto);
  }

  //If you change this method without my (CTO) consent, i will find you and i will kill you (TAKEN)
  public importMicrosoftDirectory(): Observable<any> {
    return this.authService.importMicrosoftDirectory()
      .pipe(switchMap((resp: AuthenticationResult) => {
        return this.http
          .post<Workload<any>>(`${this.baseUrl}/ImportMicrosoftDirectory`, {
            token: resp.idToken
          });
      }));
  }

  public getExcelUsersAndProfile(): Observable<Blob> {
    return this.http.get(this.baseUrl + `/GetExcelUsersAndProfile`, { responseType: 'blob' });
  }

  public updateApprovedDomains(companyID: any, domains: string[]): Observable<any> {
    return this.http.post(this.baseUrl + `/UpdateApprovedDomains?CompanyId=` + companyID, domains);
  }

  public getApprovedDomain(companyID: any): Observable<any> {
    return this.http.get(this.baseUrl + `/GetApprovedDomain?CompanyId=` + companyID,);
  }

  public getLocationMetadata(locationId: string): Observable<Workload<IMetadataTemplate>> {
    return this.http.get<any>(this.baseUrl + `/GetLocationMetadata/${locationId}`);
  }

  public addOrEditLocationMetadata(data: IMetadataTemplate)
    : Observable<Workload<IMetadataTemplate>> {
    return this.http.post<any>(this.baseUrl + `/SaveLocationMetadata`, data);
  }

}
