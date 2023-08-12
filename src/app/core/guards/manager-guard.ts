import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { AuthenticationService, UserRole } from "../services";

@Injectable()
export class ManagerSuperAdminGuard implements CanActivate {

  constructor(private _router: Router, private _authService: AuthenticationService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const isSuperAdminOrAdmin = this._authService.currentUserHasOneRole(
    [
        UserRole.SuperAdmin,
        UserRole.Admin,
    ]);

    if (!isSuperAdminOrAdmin) {
      this._router.navigate(['/login']);
      return false;
    }

    return true;
  }
}

@Injectable()
export class ManagerAdminGuard implements CanActivate {

  constructor(private _router: Router, private _authService: AuthenticationService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const isSuperAdminOrAdmin = this._authService.currentUserHasOneRole(
    [
        UserRole.SuperAdmin,
        UserRole.Admin
    ]);

    if (!isSuperAdminOrAdmin) {
      this._router.navigate(['/login']);
      return false;
    }

    return true;
  }
}

@Injectable()
export class ManagerGuard implements CanActivate {

  constructor(private _router: Router, private _authService: AuthenticationService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const isAdminOrManager = this._authService.currentUserHasOneRole(
      [
        UserRole.Admin,
        UserRole.FullManager,
        UserRole.HRManager,
        UserRole.OfficeManager,
        UserRole.StatManager,
        UserRole.TeamManager,
        UserRole.OrganizationManager
      ]);
    if (!isAdminOrManager) {
      this._router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }
}


@Injectable()
export class ManagerOfficeGuard implements CanActivate {

  constructor(private _router: Router, private _authService: AuthenticationService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const isAdminOrOfficeManager = this._authService.currentUserHasOneRole(
      [
        UserRole.Admin,
        UserRole.FullManager,
        UserRole.OfficeManager,
        UserRole.OrganizationManager
      ]);
    if (!isAdminOrOfficeManager) {
      this._router.navigate(['/manager/calendar']);
      return false;
    }
    return true;
  }
}

@Injectable()
export class ManagerOrganizationGuard implements CanActivate {

  constructor(private _router: Router, private _authService: AuthenticationService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const isAdminOrOfficeManager = this._authService.currentUserHasOneRole(
      [
        UserRole.Admin,
        UserRole.FullManager,
        UserRole.OrganizationManager
      ]);
    if (!isAdminOrOfficeManager) {
      this._router.navigate(['/manager/calendar']);
      return false;
    }
    return true;
  }
}

@Injectable()
export class ManagerStatsGuard implements CanActivate {

  constructor(private _router: Router, private _authService: AuthenticationService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const isAdminOrOfficeManagerOrRH = this._authService.currentUserHasOneRole(
      [
        UserRole.Admin,
        UserRole.FullManager,
        UserRole.HRManager,
        UserRole.OfficeManager,
        UserRole.StatManager,
        UserRole.OrganizationManager
      ]);

    if (!isAdminOrOfficeManagerOrRH) {
      this._router.navigate(['/manager/calendar']);
      return false;
    }
    return true;
  }
}


@Injectable()
export class ManagerMapGuard implements CanActivate {

  constructor(private _router: Router, private _authService: AuthenticationService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (!this._authService.isMapCapabilitiesEnabled) {
      this._router.navigate(['/manager/calendar']);
      return false;
    }
    return true;
  }
}

@Injectable()
export class ManagerDirectoryGuard implements CanActivate {

  constructor(private _router: Router, private _authService: AuthenticationService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    const hasRolesHavingRights = this._authService.currentUserHasOneRole(
      [
        UserRole.Admin,
        UserRole.HRManager,
        UserRole.FullManager,
        UserRole.OrganizationManager,
      ]);

    if (!hasRolesHavingRights) {
      this._router.navigate(['/manager/calendar']);
      return false;
    }
    return true;
  }

}

