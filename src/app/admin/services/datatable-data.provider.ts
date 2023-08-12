import { Injectable, Injector } from '@angular/core';
import { AdminService, Page, PagedData, PAGED_DATA_ROUTE_API_TOKEN } from '@flex-team/core';
import { Observable } from 'rxjs';

@Injectable()
export class DatatableDataProvider {

  path: string;

  constructor(private adminService: AdminService,
    private injector: Injector) {
    this.path = this.injector.get(PAGED_DATA_ROUTE_API_TOKEN);
  }

  public getPagedData(page: Page, path: string): Observable<PagedData<any>> {
    return this.adminService.getPagedData(page, path).pipe(d => d);
  }

  public update(model: any, path: string): Observable<any> {
    return this.adminService.update(model, path);
  }

  public create(model: any, path: string): Observable<any> {
    return this.adminService.create(model, path);
  }

  public delete(model: any, path: string): Observable<any> {
    return this.adminService.delete(model, path);
  }

  public archive(model: any, path: string): Observable<any> {
    return this.adminService.archive(model, path);
  }

  public restore(model: any, path: string): Observable<any> {
    return this.adminService.restore(model, path);
  }

  public getAllUsersOfCompany(companyId: string): Observable<any> {
    return this.adminService.getAllUsersOfCompany(companyId);
  }
}
