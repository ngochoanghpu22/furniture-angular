import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Location, User, UserMetadata, Workload } from './workloads';

@Injectable()
export class ProfileService extends BaseApiService {
  constructor(protected http: HttpClient) {
    super(http);
  }

  public getPreferedWeek(userId: string): Observable<Workload<Location[]>> {
    return this.http.get<Workload<Location[]>>(
      this.accessPointUrl + `/api/Profile/GetPreferedWeek/${userId}`
    );
  }

  public getFavoriteColleagues(): Observable<Workload<User[]>> {
    return this.http.get<Workload<User[]>>(
      this.accessPointUrl + '/api/Profile/GetFavoriteColleagues'
    );
  }

  public updateProfile(dto: any): Observable<Workload<any>> {
    return this.http.post<Workload<any>>(
      this.accessPointUrl + '/api/Profile/UpdateProfile',
      dto
    );
  }

  public updateMetadata(data: Partial<UserMetadata>): Observable<Workload<any>> {
    return this.http.post<Workload<any>>(
      this.accessPointUrl + '/api/Profile/UpdateMetadata',
      data
    );
  }

  public checkCompatibilityWorkingPolicyWithDefaultWeek(dto: any): Observable<Workload<boolean>> {
    return this.http.post<Workload<boolean>>(this.accessPointUrl + '/api/Profile/checkCompatibilityWorkingPolicyWithDefaultWeek', dto);
  }

  public updatePreferedWeek(dto: {
    userId: string,
    dayIndex: number;
    locationId: string;
  }): Observable<Workload<any>> {
    return this.http.post<Workload<any>>(
      this.accessPointUrl + '/api/Profile/UpdatePreferedWeek',
      dto
    );
  }

  public updateAvatar(
    tinyPicture: string,
    smallPicture: string
  ): Observable<Workload<string>> {
    return this.http.post<Workload<string>>(
      this.accessPointUrl + '/api/Profile/updateAvatar',
      { tinyPicture: tinyPicture, smallPicture: smallPicture }
    );
  }

  /**
   * `API` Get profile info
   * @returns 
   */
  public getProfileInfo(): Observable<Workload<User>> {
    return this.http
      .get<Workload<User>>(this.accessPointUrl + `/api/Profile/GetProfileInfo`);
  }

  // Update User Working policy
  public updateUserWorkingPolicy(dto: any): Observable<Workload<any>> {
    return this.http.post<Workload<any>>(
      this.accessPointUrl + '/api/Profile/updateUserWorkingPolicy', {
      userId: dto.userId,
      workingPolicyId: dto.workingPolicyId,
    });
  }
}
