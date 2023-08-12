import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Building, ManagerOfficeService, Workload } from '@flex-team/core';
import { Observable } from 'rxjs';

@Injectable()
export class ManagerMapResolver implements Resolve<Workload<Building[]>> {

  constructor(private managerOfficeService: ManagerOfficeService) { }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Workload<Building[]> | Observable<Workload<Building[]>> | Promise<Workload<Building[]>> {
      return this.managerOfficeService.getBuildings();
  }
}

