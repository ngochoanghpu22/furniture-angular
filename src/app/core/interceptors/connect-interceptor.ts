import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services';
import { LanguageLocales } from '../services/workloads/enums/language.enum';
import { LocalStorageKeys } from '../services/workloads/enums/LocalStorageKeys';

@Injectable()
export class ConnectInterceptor implements HttpInterceptor {

  constructor(private authService: AuthenticationService) {
    
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const currentUser = this.authService.currentUser;
    let headers = new HttpHeaders();

    if (currentUser) {
      const token = currentUser.token;

      headers = req.headers.set("Authorization", `Bearer ${token}`);

      if (!headers.get('Content-Type')) {
        headers = headers.set('Content-Type', 'application/json');
      }

      const localLang = localStorage.getItem(LocalStorageKeys.Language)
      const languageLocales = LanguageLocales[localLang]
      if (languageLocales) {
        headers = headers.set('Accept-Language', languageLocales)
      }
    }
    
    const authReq = req.clone({
      headers: headers,
      withCredentials: true // Importand for consistent session id in ASP.NET
    });
    return next.handle(authReq);
  }
}
