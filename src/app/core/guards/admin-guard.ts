import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs/internal/Observable";
import { AuthenticationService } from "../services/authentication.service";

@Injectable()
export class AdminGuard implements CanActivate {

    constructor(private _router: Router, private _authService: AuthenticationService) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | boolean {
        if (!this._authService.userIsAdmin) {
            this._router.navigate(['/dashboard']);
            return false;
        }
        return true;
    }
}