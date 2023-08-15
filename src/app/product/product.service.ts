import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BaseApiService } from '../core/service/base-api.service';

@Injectable({ providedIn: 'root' })
export class ProductService extends BaseApiService {

  private routeProduct: string = "product"

  constructor(
    protected override http: HttpClient
  ) {
    super(http);
  }

  public getProducts(categoryId: any) {
    return this.http.get<any>(`${this.baseUrl}/api/${this.routeProduct}/get-by-categoryId?categoryId=${categoryId}`);
  }

  public getProductDetail(productId: any) {
    return this.http.get<any>(`${this.baseUrl}/api/${this.routeProduct}/get-by-id?productId=${productId}`);
  }

  public createOrder(body: any) {
    return this.http.post<any>(`${this.baseUrl}/api/order/create`, body);
  }
}