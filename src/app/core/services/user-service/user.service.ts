import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { createRequestOption } from '../../helpers/request';
import { BaseApiService } from '../base-api.service';

@Injectable()
export class UserService extends BaseApiService {

  private route: string = "Users"

  private routeUserTask: string = "UserTask"

  private baseUrl = '';

  constructor(
    protected http: HttpClient,
    
  ) {
    super(http);
    this.baseUrl = `${this.accessPointUrl}`;
  }

  public pickTask(body: any) {
    return this.http.post<any>(`${this.baseUrl}/api/${this.routeUserTask}/pick-task`, body);
  }

  public finishTask(body: any) {
    return this.http.post<any>(`${this.baseUrl}/api/${this.routeUserTask}/finish-task`, body);
  }
 
  public updateStatus(body: any) {
    return this.http.put<any>(`${this.baseUrl}/api/${this.route}/update-status?userId=${body.userId}&status=${body.status}`, null);
  }

  public updateProfile(body: any) {
    return this.http.put<any>(`${this.baseUrl}/api/${this.route}/update-user`, body);
  }

  public getClients(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/${this.route}/get-clients`);
  }

  public createUser(body: any) {
    if (!body.id) {
      return this.http.post<any>(`${this.baseUrl}/api/${this.route}`, body);
    }
    
    return this.http.put<any>(`${this.baseUrl}/api/${this.route}/update-user`, body);
  }

  public updateAvatar(fileToUpload: File, userId: string) {
    const formData: FormData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    formData.append("userId", userId);

    return this.http.put<any>(`${this.baseUrl}/api/${this.route}/update-avatar`, formData);
  }

  public getProfile(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/${this.route}/${userId}`);
  }

  public getUsers(req?: any): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<any>(`${this.baseUrl}/api/${this.route}/search`, { params: options, observe: 'response', responseType: 'json' });
  }

  public getUserById(req?: any): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<any>(`${this.baseUrl}/api/${this.route}/get-user-by-id`, { params: options, observe: 'response', responseType: 'json' });
  }

}