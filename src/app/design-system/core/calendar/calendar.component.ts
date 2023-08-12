import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Day, DayClickedEvent, StaticDataService, Week } from '@flex-team/core';
import { SwiperComponent } from 'swiper/angular';
import { SwiperEvents } from 'swiper/types';

@Component({
  selector: 'fxt-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  host: {
    'class': 'fxt-calendar'
  }
})
export class CalendarComponent implements OnInit {

  @ViewChild("swiper") swiperCmp: SwiperComponent | undefined;

  @Input() slides: Array<Array<Week>> = [];

  @Input() hideGauge: boolean = true;
  @Input() activeDayInCalendar: number = 0;
  @Input() daySelected: Day = new Day();
  @Input() canEdit = false;

  @Output() slideChanged: EventEmitter<SwiperEvents['slideChange']> = new EventEmitter<SwiperEvents['slideChange']>();
  @Output() dayClicked: EventEmitter<DayClickedEvent> = new EventEmitter<DayClickedEvent>();

  public workingDays: string[] = [];

  constructor(private staticDataService: StaticDataService
  ) {
    this.workingDays = this.staticDataService.getWorkingDays({ long: false });
  }

  ngOnInit() {
  }

  onDayClicked(day: Day[], week: Week, event: Event) {
    this.dayClicked.emit({ day, week, event });
  }

  trackByFn(index: number, item: Day[]): string {
    return item[0].dayDate;
  }

}
