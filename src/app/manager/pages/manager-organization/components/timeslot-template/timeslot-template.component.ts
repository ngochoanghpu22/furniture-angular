import { WeekDay } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import { TimeSlotTemplateDTO, LanguageLocales, MessageService, TimeslotTemplateService, Workload } from '@flex-team/core';
import { CalendarOptions, EventApi, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { TranslocoService } from '@ngneat/transloco';
import { ColumnMode, SelectionType, TableColumn } from '@swimlane/ngx-datatable';
import { DateTime } from 'luxon';
import { finalize } from 'rxjs/operators';
import { TimeslotTemplateModalComponent } from '../timeslot-template-modal/timeslot-template-modal.component';

@Component({
  selector: 'app-timeslot-template',
  templateUrl: './timeslot-template.component.html',
  styleUrls: ['./timeslot-template.component.scss']
})
export class TimeslotTemplateComponent implements OnInit {

  @ViewChild('fxtFullCalendar', { static: true }) fxtFullCalendar: FullCalendarComponent;

  @Input() editable: boolean = true;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: false,
    dayHeaders: true,
    dayHeaderFormat: { weekday: 'long' },
    allDaySlot: false,
    selectable: true,
    nowIndicator: true,
    slotMinTime: "06:00:00",
    slotMaxTime: "21:00:00",
    businessHours: {
      startTime: '06:00',
      endTime: '21:00',
    },
    slotLabelFormat: {
      hour: '2-digit',
      hour12: false,
      minute: 'numeric',
      omitZeroMinute: false,
      meridiem: false
    },
    eventTimeFormat: {
      hour: '2-digit',
      hour12: false,
      minute: 'numeric',
      omitZeroMinute: false,
      meridiem: false
    },
    eventStartEditable: true,
    droppable: false,
    eventOverlap: false,
    eventConstraint: 'businessHours',
    eventClassNames: 'fxt-timeslot-event',
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    eventAllow: this.eventAllow.bind(this)
  };

  public timeSlotTemplates: TimeSlotTemplateDTO[];

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  columns: TableColumn[];
  locale: string;

  loading = false;

  constructor(
    private modalService: ModalService,
    private translocoService: TranslocoService,
    private timeslotTemplateService: TimeslotTemplateService,
    private messageService: MessageService
  ) {
    this.locale = LanguageLocales[this.translocoService.getActiveLang()];
  }

  ngOnInit(): void {
    this.getTimeSlotTemplates();
    this.columns = [
      { name: 'organization.timeslot_name', prop: 'name', sortable: true },
      {
        name: 'organization.start_hour', prop: 'startHour',
        sortable: true, cellClass: 'column-number'
      },
      {
        name: 'organization.start_minute', prop: 'startMinutes',
        sortable: true, cellClass: 'column-number'
      },
      {
        name: 'organization.stop_hour', prop: 'stopHour',
        sortable: true, cellClass: 'column-number'
      },
      {
        name: 'organization.stop_minute', prop: 'stopMinutes',
        sortable: true, cellClass: 'column-number'
      },

    ];
  }

  openEditTimeSlotModal(item?: TimeSlotTemplateDTO) {
    const modalRef = this.modalService.open(TimeslotTemplateModalComponent, {
      width: 'auto',
      disableClose: true,
      data: item
    })

    modalRef.afterClosed$.subscribe(r => {
      if (r) {
        this.getTimeSlotTemplates();
      }
    });
  }

  eventAllow(dropInfo: any, draggedEvent: any) {
    return dropInfo.start.getDay() === draggedEvent.start.getDay();
  }

  handleEventClick(arg: any) {
    const event = (arg.event as EventApi).toJSON();
    const item = { ...event.extendedProps.timeSlotRef };
    this.openEditTimeSlotModal(item);
  }

  handleEventDrop(arg: any) {
    this.addOrEdit(arg.event as EventApi);
  }

  handleEventResize(arg: any) {
    this.addOrEdit(arg.event as EventApi);
  }

  handleSelect(arg: any) {
    if (!this.editable) {
      if (arg.jsEvent) {
        arg.jsEvent.preventDefault();
        arg.jsEvent.stopPropagation();
      }
      return;
    }

    const start = DateTime.fromJSDate(arg.start);
    const end = DateTime.fromJSDate(arg.end);

    const isSameDay = start.weekday == end.weekday;

    const dayOfWeek = start.weekday % 7;
    const isWeekend = dayOfWeek == WeekDay.Saturday || dayOfWeek == WeekDay.Sunday;

    if (isWeekend || !isSameDay) {
      return;
    }

    const dto = <TimeSlotTemplateDTO>{
      dayOfWeek: dayOfWeek,
      startHour: start.hour,
      startMinutes: start.minute,
      stopHour: end.hour,
      stopMinutes: end.minute,
    }

    this.openEditTimeSlotModal(dto);
  }

  addOrEdit(eventApi: EventApi) {

    const dto: TimeSlotTemplateDTO = { ...eventApi.extendedProps.timeSlotRef };

    dto.startHour = eventApi.start.getHours();
    dto.startMinutes = eventApi.start.getMinutes();
    dto.stopHour = eventApi.end.getHours();
    dto.stopMinutes = eventApi.end.getMinutes();

    this.loading = true;

    this.timeslotTemplateService.addOrEditTimeSlot(dto)
      .pipe(finalize(() => this.loading = false))
      .subscribe(resp => {
        if (resp.statusCode == 0) {
          this.messageService.success('organization.create_timeslot_success');
          if (dto.id) {
            const index = this.timeSlotTemplates.findIndex(x => x.id == dto.id);
            this.timeSlotTemplates[index] = dto;
          } else {
            this.timeSlotTemplates.push(dto);
          }
          this._updateView(this.timeSlotTemplates);

        } else {
          this.messageService.error('organization.create_timeslot_failed');
        }
      })
  }

  private getTimeSlotTemplates() {
    this.timeslotTemplateService.getTimeslotTemplates()
      .subscribe((resp: Workload<TimeSlotTemplateDTO[]>) => {
        this.timeSlotTemplates = resp.workload;
        this._updateView(this.timeSlotTemplates);
      })
  }

  private _updateView(timeSlotTemplates: TimeSlotTemplateDTO[]) {
    const events = timeSlotTemplates.map(x => <any>{
      id: x.id,
      startTime: this.convertToTimeString(x.startHour, x.startMinutes),
      endTime: this.convertToTimeString(x.stopHour, x.stopMinutes),
      daysOfWeek: [x.dayOfWeek],
      timeSlotRef: x
    })

    this.calendarOptions = Object.assign({}, this.calendarOptions, {
      events: events,
      editable: this.editable,
      locale: this.locale
    })
  }

  private convertToTimeString(start: number, end: number): string {
    return `${start.toLocaleString('en-US',
      { minimumIntegerDigits: 2, useGrouping: false })}:${end.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}`;
  }

}
