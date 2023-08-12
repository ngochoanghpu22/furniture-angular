import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { AuthenticationService } from "../services/authentication.service";

@Injectable()
export class LoginGuard implements CanActivate {

    constructor(private _router: Router,
        private _authService: AuthenticationService) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | boolean {
        if (this._authService.isAuthenticated) {
            return true;
        } else {
            this._router.navigate(['/login']);
            return false;
        }

    }
}