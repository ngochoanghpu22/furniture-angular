
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { ConfigurationDTO, Workload } from './workloads';

@Injectable()
export class ConfigurationService extends BaseApiService {
  private baseUrl = '';
  private name: string = "Configuration";
  constructor(protected http: HttpClient) {
    super(http);
    this.baseUrl = `${this.accessPointUrl}/api/${this.name}`;
  }

  public updateConfiguration(dto: ConfigurationDTO): Observable<Workload<ConfigurationDTO>> {
    return this.http
      .post<Workload<ConfigurationDTO>>(this.baseUrl + '/UpdateConfiguration', dto);
  }

  public checkBookingLimit(limitValue: Number): DateTime {
    const lastDate = new Date();
    const firstDay = lastDate.getDate() - (lastDate.getDay() - 1) + 6;
    const firstDateOfWeek = new Date(lastDate.setDate(firstDay));
    lastDate.setDate(firstDateOfWeek.getDate() + (Number(limitValue) * 7));
    return DateTime.fromISO(lastDate.toISOString());
  }


}
