import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { createRequestOption } from '../core/shared/utils/request';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BaseApiService } from '../core/service/base-api.service';


@Injectable({ providedIn: 'root' })
export class SignInService extends BaseApiService {

  private route: string = "Users"

  private routeSignIn: string = "Authentication"

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  public pickTask(body: any) {
    return this.http.post<any>(`${this.baseUrl}/api/${this.routeSignIn}/pick-task`, body);
  }

  public signIn(body: any) {
    return this.http.post<any>(`${this.baseUrl}/api/${this.routeSignIn}/login`, body);
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