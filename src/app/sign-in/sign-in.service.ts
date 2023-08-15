import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BaseApiService } from '../core/service/base-api.service';
import { createRequestOption } from '../core/utils/request';

@Injectable({ providedIn: 'root' })
export class SignInService extends BaseApiService {

  private routeSignIn: string = "User"

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  public signIn(body: any) {
    return this.http.post<any>(`${this.baseUrl}/api/${this.routeSignIn}/signin`, body);
  }
}