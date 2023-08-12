import { Injectable } from '@angular/core';
import { SelectionItem } from '@flex-team/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ManagerViewService {

  private _selectedDateSubject: BehaviorSubject<DateTime>;
  public selectedDate$: Observable<DateTime>;

  set selectedDate(val: DateTime) {
    this._selectedDateSubject.next(val);
  }

  get selectedDate(): DateTime {
    return this._selectedDateSubject.value;
  }

  // Selection
  get selection(): SelectionItem[] {
    return this._selectionSubject.value;
  }
  set selection(val: SelectionItem[]) {
    this._selectionSubject.next(val);
  }
  private _selectionSubject: BehaviorSubject<SelectionItem[]> = new BehaviorSubject([]);
  public selection$: Observable<SelectionItem[]>;

  constructor() {
    this._selectedDateSubject = new BehaviorSubject<DateTime>(this.getActiveDate());
    this.selectedDate$ = this._selectedDateSubject.asObservable();
    this.selection$ = this._selectionSubject.asObservable();
  }

  private getActiveDate(): DateTime {
    const date = DateTime.now();

    if (date.weekday > 5) {
      return date.plus({ days: 8 - date.weekday });
    }
    return date;
  }

}
