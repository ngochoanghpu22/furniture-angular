import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { Workload } from './workloads/Workload';

@Injectable()
export class FileService extends BaseApiService {

  constructor(protected http: HttpClient) {
    super(http);
  }

  public uploadFiles(files: FileList): Observable<Workload<number>> {
    return this.http
      .post<Workload<number>>(this.accessPointUrl + '/api/File/UploadFile',
        { files: files });
  }

  public downloadFile(data: any, filename: string) {
    const blob = new Blob([data], { type: 'application/octet-stream' });
    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(blob);
    downloadLink.setAttribute('download', filename);
    document.body.appendChild(document.createElement('a'));
    downloadLink.click();
  }
}
