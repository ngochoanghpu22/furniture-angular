import { HttpClient } from "@angular/common/http";

export class BaseApiService {
  public baseUrl: string = '';

  constructor(protected http: HttpClient) {
    this.baseUrl = this.getAccessPointUrl();
  }

  getAccessPointUrl(): string {
    return location.origin.indexOf("localhost") != -1 ? "https://localhost:5001" : location.origin;
  }
}
