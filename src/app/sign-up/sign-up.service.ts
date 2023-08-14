import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { createRequestOption } from '../core/shared/utils/request';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BaseApiService } from '../core/service/base-api.service';


@Injectable({ providedIn: 'root' })
export class SignUpService extends BaseApiService {

  private routeSignIn: string = "Users"

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  public signUp(body: any) {
    return this.http.post<any>(`${this.baseUrl}/api/${this.routeSignIn}/signUp`, body);
  }
}