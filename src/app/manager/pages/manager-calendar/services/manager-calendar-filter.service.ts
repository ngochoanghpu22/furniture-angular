import { Injectable } from '@angular/core';
import { AuthenticationService, CalendarDayFilter, FormatDates, ManagerFilter, ManagerSort, ManagerViewService, SelectionItem } from '@flex-team/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable } from 'rxjs';

const Length_Of_Week = 7;

@Injectable()
export class ManagerCalendarFilterService {

    get filter(): ManagerFilter {
        return this._filtersSubject.value;
    }

    set filter(val: ManagerFilter) {
        this._days = this.factoryDays(val);
        this._filtersSubject.next(val);
    }

    private _filtersSubject: BehaviorSubject<ManagerFilter>;
    public filters$: Observable<ManagerFilter>;


    get sort(): ManagerSort {
        return this._sortSubject.value;
    }

    set sort(val: ManagerSort) {
        const current = this.sort;
        if (current.name == val.name && current.dayIndex == val.dayIndex) {
            val = <ManagerSort>{ name: '', dayIndex: 0 };
        }
        this._sortSubject.next(val);
    }

    private _sortSubject: BehaviorSubject<ManagerSort> = new BehaviorSubject(<ManagerSort>{ name: '', dayIndex: 0 });
    public sort$: Observable<ManagerSort>;


    get weeklySummaryConfig(): { [key: string]: boolean } {
        return this._weeklySummaryConfigSubject.value;
    }

    set weeklySummaryConfig(val: { [key: string]: boolean }) {
        this._weeklySummaryConfigSubject.next(val);
    }
    private _weeklySummaryConfigSubject: BehaviorSubject<{ [key: string]: boolean }> = new BehaviorSubject({});
    public weeklySummaryConfig$: Observable<{ [key: string]: boolean }>;

    private _days: CalendarDayFilter[] = [];

    get days(): CalendarDayFilter[] {
        return this._days;
    }

    set selection(val: SelectionItem[]) {
        this.filter = new ManagerFilter(this.filter.start, this.filter.end, val);
    }

    constructor(private managerViewService: ManagerViewService, private authService: AuthenticationService) {

        this.weeklySummaryConfig = {};

        this.managerViewService.selectedDate$.subscribe(preDate => {
            if (!preDate) preDate = DateTime.now();
            const firstDayOfWeek = preDate.minus({ days: preDate.weekday - 1 });
            if (!this._filtersSubject) {
                const initialFilter = new ManagerFilter();
                initialFilter.start = firstDayOfWeek;
                initialFilter.end = firstDayOfWeek.plus({ days: Length_Of_Week - 1 });
                this._filtersSubject = new BehaviorSubject(initialFilter);
            } else {
                const current = this.filter;
                current.start = firstDayOfWeek;
                current.end = firstDayOfWeek.plus({ days: Length_Of_Week - 1 })
                this.filter = current;
            }
        })

        this.managerViewService.selection$.subscribe(selection => {
            this.selection = selection;
        })

        this.sort$ = this._sortSubject.asObservable();
        this.filters$ = this._filtersSubject.asObservable();
        this.weeklySummaryConfig$ = this._weeklySummaryConfigSubject.asObservable();

    }

    next() {
        this.navigate(Length_Of_Week);
    }

    prev() {
        this.navigate(-Length_Of_Week);
    }

    resetSort() {
        this.sort = <ManagerSort>{ name: '', dayIndex: 0 };
    }

    private navigate(nbDays: number) {
        const start = this.filter?.start.plus({ days: nbDays });
        this.managerViewService.selectedDate = start;
    }

    private factoryDays(val: ManagerFilter): any[] {
        const formatDate = this.authService.formatDate;
        const toFormat = formatDate == FormatDates.MMddyyyy ? "MM.dd" : "dd.MM";

        const days: CalendarDayFilter[] = [];
        let x = val.start;
        for (let i = 1; i < Length_Of_Week - 1; i++) {
            days.push({
                label: x.weekdayShort + ' ' + x.toFormat(toFormat),
                isToday: Math.ceil(x.diffNow('days').days) === 0,
                date: x
            });
            x = val.start.plus({ days: i });
        }

        return days;
    }


}
