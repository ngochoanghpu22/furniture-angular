import { Injectable } from '@angular/core';
import { Floor, ManagerMapContext, SelectionItem } from '@flex-team/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ManagerViewService } from './manager-view.service';

@Injectable()
export class ManagerMapViewService {

  get context(): ManagerMapContext {
    return this._contextSubject.value;
  }

  set context(val: ManagerMapContext) {
    this._contextSubject.next(val);
  }

  private _contextSubject: BehaviorSubject<ManagerMapContext>;
  public context$: Observable<ManagerMapContext>;

  // Highlight users
  get highlightUserIds(): string[] {
    return this._highlightUserIdsSubject.value;
  }
  set highlightUserIds(val: string[]) {
    this._highlightUserIdsSubject.next(val);
  }
  private _highlightUserIdsSubject: BehaviorSubject<string[]> = new BehaviorSubject([]);
  public highlightUserIds$: Observable<string[]>;

  // Highlight seats
  set highlightSeatIds(val: string[]) {
    this._highlightSeatIdsSubject.next(val);
  }
  private _highlightSeatIdsSubject: Subject<string[]> = new Subject();
  public highlightSeatIds$: Observable<string[]>;

  // Force load
  public _forceLoadSubject: Subject<void> = new Subject<void>();;
  public forceLoad$: Observable<any>;

  private _currentUserSubject: BehaviorSubject<any> = new BehaviorSubject(null);
  private _clickedUserIdSubject: BehaviorSubject<string> = new BehaviorSubject(null);
  private _officeUsersSubject: BehaviorSubject<any> = new BehaviorSubject({});

  public currentUser$: Observable<any>;
  public officeUsers$: Observable<any>;
  public clickedUserId$: Observable<string>;

  set clickedUserId(val: string) {
    this._clickedUserIdSubject.next(val);
  }

  get clickedUserId(): string {
    return this._clickedUserIdSubject.value;
  }

  set currentUser(val: any) {
    this._currentUserSubject.next(val);
  }

  get currentUser(): any {
    return this._currentUserSubject.value;
  }

  set officeUsers(val: any) {
    this._officeUsersSubject.next(val);
  }

  get officeUsers(): any {
    return this._officeUsersSubject.value;
  }

  public selection$: Observable<SelectionItem[]>;

  constructor(private managerViewService: ManagerViewService) {

    this.managerViewService.selectedDate$.subscribe(preDate => {
      if (!this._contextSubject) {
        this._contextSubject = new BehaviorSubject(<ManagerMapContext>{
          date: preDate.toJSDate(),
          floors: [],
          selectedFloor: null
        })
      } else {
        const current = this.context;
        current.date = preDate.toJSDate();
        this.context = current;
      }
    })

    this.selection$ = this.managerViewService.selection$;

    this.context$ = this._contextSubject.asObservable();
    this.highlightUserIds$ = this._highlightUserIdsSubject.asObservable();
    this.highlightSeatIds$ = this._highlightSeatIdsSubject.asObservable();
    this.forceLoad$ = this._forceLoadSubject.asObservable();
    this.clickedUserId$ = this._clickedUserIdSubject.asObservable();
    this.officeUsers$ = this._officeUsersSubject.asObservable();
    this.currentUser$ = this._currentUserSubject.asObservable();
  }

  public forceLoad() {
    this._forceLoadSubject.next();
  }

  set selectedFloor(val: Partial<Floor>) {
    const current = this.context;
    if (current.selectedFloor != val) {
      current.selectedFloor = val;
      this.context = current;
    }
  }

  set floors(val: Partial<Floor>[]) {
    const current = this.context;
    current.floors = val;
    this.context = current;
  }

  set date(val: Date) {
    this.managerViewService.selectedDate = DateTime.fromJSDate(val)
      .set({ hour: 0, minute: 0, second: 0 });
  }

  updateState(state: any) {
    const current = this.context;
    current.date = DateTime.fromISO(state.date).toJSDate();
    current.selectedFloor = state.floor;
    this.context = current;
  }

  public nextFloor() {
    const current = this.context;
    const index = current.floors.findIndex(x => x.id == current.selectedFloor.id) || 0;
    if (index < current.floors.length - 1) {
      this.selectedFloor = current.floors[index + 1];
    }
  }

  public prevFloor() {
    const current = this.context;
    const index = current.floors.findIndex(x => x.id == current.selectedFloor.id) || 0;
    if (index > 0) {
      this.selectedFloor = current.floors[index - 1];
    }
  }

}
