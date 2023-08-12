import { Observable } from 'rxjs';

export abstract class UserProfileProvider {

  constructor() { }
  abstract getFavoritesSelection(): Observable<any[]>;
  abstract getDefaultGroupsSelection(): Observable<any[]>;

}
