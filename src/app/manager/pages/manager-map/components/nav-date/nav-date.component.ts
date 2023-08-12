import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthenticationService } from '@flex-team/core';
import { DateTime } from 'luxon';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'fxt-manager-map-nav-date',
  templateUrl: './nav-date.component.html',
  styleUrls: ['./nav-date.component.scss']
})
export class NavDateComponent implements OnInit {
  
  @Input() set selectedDate(val: Date) {
    this._selectedDate = val || new Date();
    this.periodText = this.getPeriodText(this._selectedDate);
  }
  _selectedDate: Date;

  periodText: string;

  @Output() dateChanged = new EventEmitter<Date>();

  bsConfig: Partial<BsDatepickerConfig> = {
    showWeekNumbers: false,
    containerClass: 'theme-default',
    daysDisabled: [6, 0],
    customTodayClass: 'today',
    isAnimated: true
  }

  constructor(private authService: AuthenticationService) {
  }

  ngOnInit() {
  }

  onBsValueChange(event: any) {
    if (event && this._selectedDate != event) {
      this.dateChanged.emit(event);
    }
  }

  prev() {
    const current = DateTime.fromJSDate(this._selectedDate);
    const delta = current.weekday == 1 ? 3 : 1;
    const newDate = current.minus({ days: delta });
    this.dateChanged.emit(newDate.toJSDate());
  }

  next() {
    const current = DateTime.fromJSDate(this._selectedDate);
    const delta = current.weekday == 5 ? 3 : 1;
    const newDate = current.plus({ days: delta });
    this.dateChanged.emit(newDate.toJSDate());
  }

  private getPeriodText(date: Date): string {
    if (!date) return this.periodText;

    const formatDate = this.authService.formatDate;
    const toFormat = formatDate == "MM/dd/yyyy" ? "MM.dd" : "dd.MM";
    const target = DateTime.fromJSDate(date);
    return target.weekdayShort + ' ' + target.toFormat(toFormat);
  }


}
