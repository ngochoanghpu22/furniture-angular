import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BaseApiService } from '../core/service/base-api.service';
import { createRequestOption } from '../core/utils/request';

@Injectable({ providedIn: 'root' })
export class CategoryService extends BaseApiService {

  private routeCategory: string = "category"

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  public getCategories() {
    return this.http.get<any>(`${this.baseUrl}/api/${this.routeCategory}/all`);
  }
}