import { Component, Input, OnInit } from '@angular/core';
import { Day } from '@flex-team/core';
import { DateTime } from 'luxon';
@Component({
  selector: 'fxt-circle-day',
  templateUrl: './circle-day.component.html',
  styleUrls: ['./circle-day.component.scss'],
  host: {
    '[class.current]': 'isToday',
    '[class.has-gauge]': 'showGauge',
  }
})
export class CircleDayComponent implements OnInit {

  @Input() day: Day[];
  @Input() isOutOfMonth: boolean = false;
  @Input() showGauge: boolean = true;
  @Input() isToday = false;
  @Input() isSelected: boolean = false;
  @Input() customClass: string;
  @Input() canEdit = false;

  pastDay = false;

  constructor() { }


  ngOnInit(): void {
    const iso = DateTime.fromISO(this.day[0].dayDate);
    this.pastDay = iso.startOf('day') < DateTime.now().startOf('day');
  }

}
