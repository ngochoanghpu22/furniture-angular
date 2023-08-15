import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LocalStorageService } from '../service/localStorage.service';
import { AppSettings } from '../constant/appSetting';
import { SpinnerService } from '../service/spinner.service';


@Injectable()
export class AuthExpiredInterceptor implements HttpInterceptor {

  constructor(
              private spinnerService: SpinnerService
    ) {
    
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
        tap(
            (event: HttpEvent<any>) => {
                if (event instanceof HttpResponse) {
                    this.spinnerService.showOverflow = false;
                }
            },
            (err: any) => {
                this.spinnerService.showOverflow = false;
            }
        )
    );
}
}