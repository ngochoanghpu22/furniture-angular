import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { createRequestOption } from '../../helpers/request';
import { BaseApiService } from '../base-api.service';


@Injectable()
export class TaskService extends BaseApiService {

  private route: string = "Task"

  private routeUserTask: string = "UserTask"

  private baseUrl = '';

  constructor(
    protected http: HttpClient,
    
  ) {
    super(http);
    this.baseUrl = `${this.accessPointUrl}`;
  }

  public updateStatus(body: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/${this.route}/update-status?taskId=${body.campaignId}&status=${body.status}`, null);
  }

  public getTasks(req?: any): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<any>(`${this.baseUrl}/api/${this.route}/search`, { params: options, observe: 'response', responseType: 'json' });
  }

  public getMyPickedTasks(req?: any): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<any>(`${this.baseUrl}/api/${this.route}/my-picked-task/search`, { params: options, observe: 'response', responseType: 'json' });
  }

  public getMyOwnTasks(req?: any): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<any>(`${this.baseUrl}/api/${this.route}/my-own-task/search`, { params: options, observe: 'response', responseType: 'json' });
  }

  public getUsersPickedTask(req?: any, taskId?: any): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<any>(`${this.baseUrl}/api/${this.routeUserTask}/users-picked-task?taskId=${taskId}`, { params: options, observe: 'response', responseType: 'json' });
  }

  public getTaskById(req?: any): Observable<any> {
    const options = createRequestOption(req);
    return this.http.get<any>(`${this.baseUrl}/api/${this.route}/get-task-by-id`, { params: options, observe: 'response', responseType: 'json' });
  }

  public createTask(body: any) {
    if (!body.id) {
      return this.http.post<any>(`${this.baseUrl}/api/${this.route}`, body);
    }
    
    return this.http.put<any>(`${this.baseUrl}/api/${this.route}/update-task`, body);
  }

  public createTask_v2(fileToUpload: File, task: any) {

    const formData: FormData = new FormData();
    if (fileToUpload) {
      try {
        formData.append('file', fileToUpload, fileToUpload.name);
      }
      catch {}
    }
    
    if (task.id) {
      formData.append("id", task.id);
    }
    
    if (task.ownerBy) {
      formData.append("ownerBy", task.ownerBy);
    }
    
    if (task.name) {
      formData.append("name", task.name);
    }
   
    if (task.averageCompletionTime) {
      formData.append("averageCompletionTime", task.averageCompletionTime);
    }
    
    if (task.bidPerTaskCompletion) {
      formData.append("bidPerTaskCompletion", task.bidPerTaskCompletion);
    }
    
    if (task.budget) {
      formData.append("budget", task.budget);
    }
    
    if (task.document) {
      formData.append("document", task.document);
    }
   
    if (task.linkYoutube) {
      formData.append("linkYoutube", task.linkYoutube);
    }
    
    if (task.guideline) {
      formData.append("guideline", task.guideline);
    }
    
    if (task.linkPage) {
      formData.append("linkPage", task.linkPage);
    }
    
    if (task.durationOnPage) {
      formData.append("durationOnPage", task.durationOnPage);
    }

    if (task.currentStatusTask) {
      formData.append("status", task.currentStatusTask);
    }

    if (!task.id) {
      return this.http.post<any>(`${this.baseUrl}/api/${this.route}`, formData);
    }
    
    
    return this.http.put<any>(`${this.baseUrl}/api/${this.route}/update-task`, formData);
  }

}