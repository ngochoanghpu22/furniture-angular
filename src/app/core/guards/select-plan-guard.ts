import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { StaticDataService } from "../services/static-data.service";

@Injectable()
export class SelectPlanGuard implements CanActivate {

    constructor(private _router: Router, private staticDataService: StaticDataService) {
    }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ): Observable<boolean> | boolean {
        const targetJSDate = this.staticDataService.targetJSDate;
        if (targetJSDate == null) {
            this._router.navigate(['/plan']);
            return false;
        }
        return true;
    }
}