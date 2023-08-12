import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'fxt-calendar-nav',
  templateUrl: './calendar-nav.component.html',
  styleUrls: ['./calendar-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarNavComponent implements OnInit {

  @Input() buttonText: string = 'Today';

  @Output() prev: EventEmitter<any> = new EventEmitter<any>();
  @Output() today: EventEmitter<any> = new EventEmitter<any>();
  @Output() next: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

}
