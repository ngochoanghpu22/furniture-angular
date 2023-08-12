import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { StaticDataService } from './static-data.service';
import { Team, UpdateTeamDto, User, Workload } from './workloads';

@Injectable()
export class ManagerSettingService extends BaseApiService {

  private name: string = "ManagerSetting";

  private baseUrl = '';

  constructor(
    protected http: HttpClient,
    private staticDataService: StaticDataService
  ) {
    super(http);
    this.baseUrl = `${this.accessPointUrl}/api/${this.name}`;
  }

  public getBelongAndOwnedTeams(): Observable<Workload<Team[]>> {
    return this.http.get<Workload<Team[]>>(`${this.baseUrl}/GetBelongAndOwnedTeams`);
  }

  public getUsersByTeam(teamId: string): Observable<Workload<User[]>> {
    return this.http.get<Workload<User[]>>(`${this.baseUrl}/GetUsersByTeam/${teamId}`);
  }

  public removeUserFromTeam(teamId: string, userId: string) {
    return this.http.delete(`${this.baseUrl}/RemoveUserFromTeam/${teamId}/user/${userId}`);
  }

  public search(teamId: string, pattern: string): Observable<Workload<User[]>> {
    return this.http.get<Workload<User[]>>(`${this.baseUrl}/team/${teamId}/search?pattern=${pattern}`);
  }

  public addUserToTeam(teamId: string, userId: string) {
    return this.http.post(`${this.baseUrl}/team/${teamId}/addUserToTeam/user/${userId}`, {});
  }

  public getAllTeamUserOwns(userId: string): Observable<Workload<Team[]>> {
    return this.http.get<Workload<Team[]>>(`${this.baseUrl}/${userId}/GetAllTeamUserOwns`);
  }

  public getFavoriteTeam(userId: string): Observable<Workload<Team>> {
    return this.http.get<Workload<Team>>(`${this.baseUrl}/${userId}/GetFavoriteTeam`);
  }

  public getCoreTeam(userId: string): Observable<Workload<Team>> {
    return this.http.get<Workload<Team>>(`${this.baseUrl}/${userId}/GetCoreTeam`);
  }

  public getHierarchyTeamsThatUserOwnedOrBelongTo(userId: string): Observable<Workload<Team[]>> {
    return this.http.get<Workload<Team[]>>(`${this.baseUrl}/${userId}/GetHierarchyTeamsThatUserOwnedOrBelongTo`);
  }

  public inviteUser(teamId: string, user: User): Observable<Workload<User>> {
    return this.http.post<Workload<User>>(`${this.baseUrl}/team/${teamId}/InviteUser`, user);
  }

  public updateTeam(teamId: string, team: UpdateTeamDto): Observable<Workload<boolean>> {
    return this.http.put<Workload<boolean>>(`${this.baseUrl}/team/${teamId}/UpdateTeam`, {
      name: team.name,
      description: team.description
    });
  }

  public updateTeamMandatoryOfficeDays(teamId: string, dto: UpdateTeamDto): Observable<Workload<boolean>> {
    return this.http.put<Workload<boolean>>(`${this.baseUrl}/team/${teamId}/UpdateTeamMandatoryOfficeDays`, dto);
  }

  public createTeam(team: Team): Observable<Workload<Team>> {
    return this.http.post<Workload<Team>>(`${this.baseUrl}/CreateTeam`, team);
  }

  public deleteTeam(teamId: string): Observable<Workload<boolean>> {
    return this.http.delete<Workload<boolean>>(`${this.baseUrl}/team/${teamId}/DeleteTeam`);
  }

  public getSocialAndWorkingTeamsUserBelongsTo(userId: string): Observable<Workload<Team[]>> {
    return this.http.get<Workload<Team[]>>(`${this.baseUrl}/${userId}/GetSocialAndWorkingTeamsUserBelongsTo`);
  }

}
