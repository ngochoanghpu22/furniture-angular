import { Observable } from "rxjs";

export abstract class QuickPlayDataProvider {

  constructor() {}
  abstract getFavoritesSelection(): Observable<any[]>;
  abstract getDefaultGroupsSelection(): Observable<any[]>;

}
