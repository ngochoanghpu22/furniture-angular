import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { of } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { catchError, map } from "rxjs/operators";
import { OnboardingService } from "../services/onboarding.service";

@Injectable()
export class OnboardingGuard implements CanActivate {

    constructor(private _router: Router, private service: OnboardingService) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<boolean> | boolean {
        const value = route.queryParams['OnboardingToken'];
        if (value == "" || value == null) {
            this._router.navigate(['/']);
            return false;
        }
        return this.service.getOnboarding(value).pipe(
            map(r => {
                return true;
            }),
            catchError(_ => {
                this._router.navigate(['/']);
                return of(false);
            })
        )
    }
}
