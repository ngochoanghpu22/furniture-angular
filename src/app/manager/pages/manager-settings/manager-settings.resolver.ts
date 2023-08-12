import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ManagerSettingService, Team, Workload } from '@flex-team/core';
import { Observable } from 'rxjs';

@Injectable()
export class ManagerSettingsResolver implements Resolve<Workload<Team[]>> {

  constructor(private managerSettingService: ManagerSettingService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Workload<Team[]> | Observable<Workload<Team[]>> | Promise<Workload<Team[]>> {
    return this.managerSettingService.getBelongAndOwnedTeams();
  }
}
