import {
  ChangeDetectorRef, Component, ElementRef,
  Input
} from '@angular/core';
import { BaseSwiperCalendarComponent, ModalMetadataValuesComponent, ModalService } from '@design-system/core';
import {
  AuthenticationService, BookingLocationRequest, Day, DayClickedEvent,
  IMetadataItem, IMetadataValue,
  LanguageLocales, Location,
  LocationChangedEvent,
  LocationChangedEventWithTrigger,
  LocationChangedTrigger,
  LocationDetailDTO,
  LocationInfoEvent,
  LocationService,
  ManagerCalendarService, ManagerUserData, MessageService,
  PlanService, SelectionService, StaticDataService, Team,
  TimeSlotTemplateDTO, User, Week, Workload
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { DateTime } from 'luxon';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ManagerMapDetailComponent } from 'src/app/manager/pages/manager-map/components/map-detail/map-detail.component';
import { LocationProviderService } from '../location-provider.service';

@Component({
  selector: 'fxt-user-schedule',
  templateUrl: './user-schedule.component.html',
  styleUrls: ['./user-schedule.component.scss']
})
export class UserScheduleComponent extends BaseSwiperCalendarComponent {

  @Input() user: User;
  @Input() coreTeams: Team[];
  @Input() canEdit: boolean = true;

  userData: ManagerUserData;
  selectedDayIndex: number;
  halfDayEnabled = false;

  public nextDaysInOffice: Day[] = [];
  locations: Location[];
  buildings: Location[];
  isCurrentUser = false;

  selectedDay: Day[] = [];
  selectedDate: DateTime = DateTime.now();

  hostLeft: number;
  hostTop: number;

  popupLeft: number;
  popupTop: number;
  isOpen = false;

  listDays: Day[][];
  locale: string;
  timeSlotTemplates: TimeSlotTemplateDTO[];
  isMapDetailDisplayed = false;

  public LocationChangedTriggersEnum = LocationChangedTrigger;

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    protected cd: ChangeDetectorRef,
    protected selectionService: SelectionService,
    private planService: PlanService,
    private locationProviderService: LocationProviderService,
    private authService: AuthenticationService,
    private eleRef: ElementRef,
    private managerCalendarService: ManagerCalendarService,
    private messageService: MessageService,
    private translocoService: TranslocoService,
    private staticDataService: StaticDataService,
    private locationService: LocationService,
    private modalService: ModalService
  ) {
    super(cd, selectionService);
    this.locale = LanguageLocales[this.translocoService.getActiveLang()];

    if (this.locationProviderService == null) {
      throw new Error('LocationProviderService not provided');
    }

    this.timeSlotTemplates = this.authService.timeSlotTemplates;
    this.halfDayEnabled = this.authService.IsHalfDaysEnabled;

  }

  ngOnInit(): void {
    super.ngOnInit();
    this.isCurrentUser = this.authService.currentUser?.id === this.user.id;
    this.userData = new ManagerUserData();
    this.userData.id = this.user.id;

    if (!this.isCurrentUser) {
      this.planService.getNextDayInOffice(this.user.id).subscribe(data => {
        this.nextDaysInOffice = data.workload;
      })
    }

    this.staticDataService.locationChanged$.pipe(takeUntil(this._destroyed))
      .subscribe(payload => {
        if (payload.trigger === LocationChangedTrigger.UserProfile) {
          this.isOpen = false;
          this.saveLocationOrBookSeat(payload);
        }
      });

    this.staticDataService.userProfileChanged$
      .pipe(takeUntil(this._destroyed))
      .subscribe(payload => {
        if (payload && this.isMapDetailDisplayed) {
          this.paginateData(this.pageIndex);
        }
      });

  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  paginateData(index: number) {
    const target = DateTime.now().plus({ months: index - this.centeredPageIndex });

    this.planService.getMonthStatusForUser(this.user.id, target.year, target.month)
      .subscribe((resp: Workload<Week[]>) => {
        if (!resp.errorCode) {
          this.slides[index] = [];
          resp.workload.forEach(c => this.slides[index].push(c));

          if (this.pageIndex === index) {
            this.getPossibleLocations(this.slides[index]);
          }
        }
      },
        _ => { });
  }

  onDayClicked($event: DayClickedEvent) {

    if (!this.locations) return;

    this.selectedDayIndex = this.listDays.findIndex(x => x[0].dayDate == $event.day[0].dayDate);

    if (this.hostTop == null || this.hostLeft == null) {
      this.updateHostPositionIfNeeded();
    }

    const target = $event.event.target as HTMLElement;
    if (target.classList.contains('cell-day')) return;

    this.selectedDay = $event.day;
    this.selectedDate = DateTime.fromISO(this.selectedDay[0].dayDate);

    const datesOfWeek = this.staticDataService.getDatesOfWeekForGivenDate(this.selectedDate, { long: false, includeWeekend: false });
    const monday = datesOfWeek[0];
    const friday = datesOfWeek[datesOfWeek.length - 1];

    this.userData.days = this.listDays.filter(x => {
      const d = DateTime.fromISO(x[0].dayDate);
      return d >= monday && d <= friday;
    });

    const rect = ($event.event.target as HTMLElement).getBoundingClientRect();

    this.popupLeft = (Math.floor(rect.left) - this.hostLeft + 80);
    this.popupTop = (Math.floor(rect.top) - this.hostTop + 70);

    $event.event.preventDefault();
    $event.event.stopPropagation();

    this.isOpen = true;

  }

  onPopLocationHidden() {
    this.isOpen = false;
  }

  onSeatClicked() {

  }

  confirm(userId: string, start: DateTime, end: DateTime) {
    this.managerCalendarService.confirm(userId, start, end).subscribe(() => {
      this.paginateData(this.pageIndex);
      this.messageService.success();
    });
  }

  private updateHostPositionIfNeeded() {
    const rect = (this.eleRef.nativeElement as HTMLElement)
      .querySelector('.container-schedule')
      .getBoundingClientRect();
    this.hostLeft = rect.left;
    this.hostTop = rect.top;
  }

  onSlideChange() {

    if (this.swiperCmp?.swiperRef != null) {

      this.pageIndex = this.activeIndex;

      this.currentDate = DateTime.now().plus({
        month: this.pageIndex - this.centeredPageIndex
      });

      this.month = this.currentDate.toFormat("LLLL");
      this.year = this.currentDate.year.toString();

      this.paginateData(this.pageIndex);
      this.paginateData(this.pageIndex - 1);
      this.paginateData(this.pageIndex + 1);

      this.activeDayInCalendar = this.pageIndex == this.centeredPageIndex ? DateTime.now().day : 0;

      this.updateChangesInView();

      this.cd.detectChanges();

    }
  }

  hidePanelLocation() {
    this.selectedDate = null;
    this.selectedDay = null;
    this.selectedDayIndex = null;
  }


  private saveLocationOrBookSeat(payload: LocationChangedEventWithTrigger) {

    const $events = payload.modeHalfDay ? payload.events : [payload.events[0]];

    const request = {
      userId: this.user.id,
      dayIndex: this.selectedDayIndex,
      date: this.selectedDate.toJSDate(),
      modeHalfDay: payload.modeHalfDay,
      locations: $events.map(x => <LocationDetailDTO>{
        target: x.location.id,
        targetLocation: x.location,
        timeslotId: x.timeslotId,
        seatId: x.seat?.id,
        doLeave: x.doLeave,
        metadataValues: x.metadataValues
      })
    } as BookingLocationRequest;

    this.locationProviderService.trySaveLocationOrBookSeat(request, {
      name: this.coreTeams.map(x => x.name).join(', ')
    }).subscribe(resp => {
      if (!resp.errorCode) {
        if (resp.workload != null) {
          this.onSuccessBookingLocation();
        }
      } else {
        this.messageService.error(`message_error.${resp.errorCode}`);
      }
      this.hidePanelLocation();
    })

  }

  public showMetadataDialog($events: LocationInfoEvent) {
    const dayInfo = this.selectedDay[$events.timeslotIndex];
    const $event = $events.locations[$events.timeslotIndex];

    if ($event?.location?.metadataTemplate?.metadataItems?.length > 0) {
      const { location } = $event;
      const itemsModel = location.metadataTemplate.metadataItems;
      const valueModel = dayInfo.metadataValues;
      if (itemsModel.length > 0) {
        const bookingId = valueModel[0]?.idBooking || dayInfo.bookingId;
        const action$ = this.openModalAddOrEditMetadataValues($event, {
          valueModel,
          itemsModel,
          bookingId,
          location
        });

        action$.subscribe(resp => {
          if (resp) {
            this.updateMetadataValues($events, resp);
          }
        })
      }

    }
  }

  public onLocationOfficeClicked($event: LocationChangedEvent) {
    this.displayModalMapDetail($event);
  }

  /**
   * On success booking location
   */
  private onSuccessBookingLocation() {
    this.paginateData(this.pageIndex);
    this.messageService.success();
    this.staticDataService.notifyUserProfileChanged();
  }


  /**
   * Display modal map detail
   * @param $event 
   */
  private displayModalMapDetail($event: LocationChangedEvent) {
    this.isMapDetailDisplayed = true;
    const modalRef = this.modalService.open(ManagerMapDetailComponent, {
      data: {
        modeModal: true,
        date: $event.date,
        targetUserId: $event.userId,
        seat: $event.seat
      }
    });

    modalRef.afterClosed$.subscribe(resp => {
      this.staticDataService.isModalMapDetailDisplayed = false;
      this.isMapDetailDisplayed = false;
      if (resp != null) {
        this.onSuccessBookingLocation();
      }
    });
  }

  private updateMetadataValues($events: LocationInfoEvent, metadataValues: IMetadataValue[]) {

    return this.planService.updateMetadataValues(metadataValues).subscribe(resp => {
      if (!resp.errorCode) {
        this.paginateData(this.pageIndex);
        this.messageService.success();
      }
    })
  }

  private openModalAddOrEditMetadataValues($event: LocationChangedEvent, data: any): Observable<any> {
    const itemsModel: Array<IMetadataItem> = data.itemsModel;
    const hideBtnClose = itemsModel.filter(i => i.isMandatory).length > 0;
    const modalRef = this.modalService.open(ModalMetadataValuesComponent, {
      width: '500px',
      maxHeight: '500px',
      customClass: 'modal-selection-seat-container',
      data: data,
      hideBtnClose
    });

    return modalRef.afterClosed$;
  }

  private getPossibleLocations(slide: Week[]) {

    this.listDays = [];
    slide.forEach((x: Week) => {
      x.days.forEach((d: Day[]) => {
        this.listDays.push([...d]);
      });
    })

    const from = slide[0].days[0][0] as Day;
    const lastWeek = slide[slide.length - 1];
    const to = lastWeek.days[lastWeek.days.length - 1][0] as Day;

    const fromDate = DateTime.fromISO(from.dayDate).toJSDate();;
    const toDate = DateTime.fromISO(to.dayDate).toJSDate();

    this.locationService.getLocationsBetweenDate(fromDate, toDate).subscribe(
      (l) => {
        this.locations = l.workload.filter(x => x.archived === false);
        this.setupBuildings();
      }
    );
  }

  private setupBuildings() {
    this.buildings = this.locations.filter(x => x.archived === false)
      .find(x => !x.hierarchyLevel && x.inOffice)?.children || [];
  }

}
