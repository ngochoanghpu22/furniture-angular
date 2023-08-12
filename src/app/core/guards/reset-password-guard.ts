import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";

@Injectable()
export class ResetPasswordGuard implements CanActivate {

    constructor(private _router: Router) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<boolean> | boolean {
        const value = route.queryParams['resetToken'];
        if (value == "" || value == null) {
            this._router.navigate(['/']);
            return false;
        }
        return true;
    }
}
