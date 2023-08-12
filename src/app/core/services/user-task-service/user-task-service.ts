import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { createRequestOption } from '../../helpers/request';
import { BaseApiService } from '../base-api.service';


@Injectable()
export class UserTaskService extends BaseApiService {

  private route: string = "UserTask"

  private baseUrl = '';

  constructor(
    protected http: HttpClient,
    
  ) {
    super(http);
    this.baseUrl = `${this.accessPointUrl}`;
  }

  public doTask(body: any) {
    return this.http.post<any>(`${this.baseUrl}/api/${this.route}/do-task`, body);
  }

}