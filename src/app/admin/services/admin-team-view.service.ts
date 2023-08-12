import { Injectable } from '@angular/core';
import { Team } from '@flex-team/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class AdminTeamViewService {

  private _subject : BehaviorSubject<Team | null> = new BehaviorSubject<Team | null>(null);

  get team(): Team | null {
    return this._subject.getValue();
  }

  set team(val: Team | null){
    this._subject.next(val);
  }

  team$: Observable<Team | null> = this._subject.asObservable();

  constructor() { }

}
