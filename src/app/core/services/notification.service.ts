import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Notification, Workload } from './workloads';

@Injectable()
export class NotificationService extends BaseApiService {

  constructor(protected http: HttpClient) {
    super(http);
  }

  public getNotifications(): Observable<Workload<Notification[]>> {
    return this.http
      .get<Workload<Notification[]>>(this.accessPointUrl + '/api/Notification/GetNotifications');
  }

  public closeNotification(id: string): Observable<Workload<boolean>> {
    return this.http
      .put<Workload<boolean>>(this.accessPointUrl + `/api/Notification/${id}/CloseNotification`, {});
  }
}
