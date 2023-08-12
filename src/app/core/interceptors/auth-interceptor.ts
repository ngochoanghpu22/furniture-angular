import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuthenticationService, AuthProvider, ErrorCodeValues } from '../services';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthenticationService, private router: Router,
        private toastr: ToastrService) { }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.authService.showOverflow = true;
        return next.handle(req)
            .pipe(tap(evt => {
                if (evt instanceof HttpResponse) {
                    this.authService.showOverflow = false;
                    if (evt.status == 200 && evt.body?.errorCode == ErrorCodeValues.USER_NOT_LOGGED) {
                        this.authService.logout(AuthProvider.None);
                        this.router.navigate(['/login']);
                    }
                }
                return of(evt);
            }), catchError((err: any) => {
                this.authService.showOverflow = false;
                if (err.status == 401) {
                  this.authService.logout(AuthProvider.None);
                    this.router.navigate(['/login']);
                }
                this.toastr.error(err.error ? err.error : err.message);
                return of(err);
            }))
    }

}
