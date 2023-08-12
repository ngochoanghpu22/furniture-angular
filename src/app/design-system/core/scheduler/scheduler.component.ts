import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MeetingListItemDTO } from '@flex-team/core';
import { CalendarOptions, EventApi, FullCalendarComponent } from '@fullcalendar/angular';

@Component({
  selector: 'fxt-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.scss']
})
export class SchedulerComponent implements OnInit, OnChanges, AfterViewInit {

  @ViewChild('fxtFullCalendar', { static: true }) fxtFullCalendar: FullCalendarComponent;

  @Input() meetings: MeetingListItemDTO[] = [];
  @Input() selectedDate: Date;
  @Input() editable: boolean = true;

  @Output() dateSelect: EventEmitter<{ start: Date, end: Date }>
    = new EventEmitter<{ start: Date, end: Date }>();
  @Output() eventClick: EventEmitter<MeetingListItemDTO> = new EventEmitter<MeetingListItemDTO>();

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridDay',
    headerToolbar: false,
    dayHeaders: false,
    allDaySlot: false,
    selectable: true,
    nowIndicator: true,
    slotMinTime: "06:00:00",
    slotMaxTime: "21:00:00",
    eventStartEditable: false,
    eventDurationEditable: false,
    droppable: false,
    slotLabelFormat: {
      hour: '2-digit',
      hour12: false,
      minute: 'numeric',
      omitZeroMinute: false,
      meridiem: false
    },
    eventClick: this.handleEventClick.bind(this),
    select: this.handleSelect.bind(this)
  };

  constructor(private cd: ChangeDetectorRef) {
  }

  ngAfterViewInit(): void {
    this.fxtFullCalendar.getApi()?.gotoDate(this.selectedDate);
  }

  ngOnInit() {
    // //HACK: to resolve problem width, to find another fix
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 0)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.meetings && changes.meetings.currentValue) {
      const events = this.meetings.map(x => <any>{
        id: x.id,
        organizerId: x.organizerId,
        title: `${x.name} - ${x.nbUsers} participants`,
        start: x.startDate,
        end: x.endDate
      })

      this.calendarOptions = Object.assign({}, this.calendarOptions, {
        events: events,
        editable: this.editable
      })
    }
  }

  handleEventClick(arg: any) {
    const event = (arg.event as EventApi).toJSON();
    const item = {
      startDate: new Date(event.start),
      endDate: new Date(event.end),
      id: event.id,
      organizerId: event.extendedProps.organizerId
    } as MeetingListItemDTO;
    this.eventClick.emit(item);
  }

  handleSelect(arg: any) {
    if (!this.editable) {
      if (arg.jsEvent) {
        arg.jsEvent.preventDefault();
        arg.jsEvent.stopPropagation();
      }
    } else {
      this.dateSelect.emit({
        start: arg.start,
        end: arg.end
      });
    }
  }
}
