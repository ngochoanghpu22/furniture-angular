import { Injectable } from '@angular/core';
import { Company } from '@flex-team/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class AdminCompanyViewService {

  private _companySubject : BehaviorSubject<Company | null> = new BehaviorSubject<Company | null>(null);

  get company(): Company | null {
    return this._companySubject.getValue();
  }

  set company(val: Company | null){
    this._companySubject.next(val);
  }

  company$: Observable<Company | null> = this._companySubject.asObservable();

  constructor() { }

}
