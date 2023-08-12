import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ManagerOrganizationViewService {

  private _locationIdSubject: BehaviorSubject<string> = new BehaviorSubject<any>(null);
  buildingId$: Observable<string> = this._locationIdSubject.asObservable();

  set locationId(val: string) {
    this._locationIdSubject.next(val);
  }

  get locationId(): string {
    return this._locationIdSubject.getValue();
  }

  needReload = false;

  constructor() { }

}
