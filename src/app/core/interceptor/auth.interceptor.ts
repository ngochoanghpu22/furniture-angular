import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../service/localStorage.service';
import { AppSettings } from '../constant/appSetting';
import { SpinnerService } from '../service/spinner.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private localStorageService: LocalStorageService,
              private spinnerService: SpinnerService
    ) {
    
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spinnerService.showOverflow = true;
    const currentUser = this.localStorageService.getItem(AppSettings.STORAGE.Profile);
    let headers = new HttpHeaders();

    if (currentUser) {
      const token = JSON.parse(currentUser).token;

      headers = req.headers.set("Authorization", `Bearer ${token}`);

      if (!headers.get('Content-Type')) {
        headers = headers.set('Content-Type', 'application/json');
      }
    }
    
    const authReq = req.clone({
      headers: headers,
      withCredentials: true // Importand for consistent session id in ASP.NET
    });
    return next.handle(authReq);
  }
}