import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BaseApiService } from '../core/service/base-api.service';

@Injectable({ providedIn: 'root' })
export class OrderService extends BaseApiService {

  private routeOrder: string = "order"

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  public getOrders() {
    return this.http.get<any>(`${this.baseUrl}/api/${this.routeOrder}/all`);
  }

  public getOrderDetail(orderId: any) {
    return this.http.get<any>(`${this.baseUrl}/api/${this.routeOrder}/detail?orderId=${orderId}`);
  }
}