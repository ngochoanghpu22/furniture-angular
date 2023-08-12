import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BaseSwiperCalendarComponent, ModalService
} from '@design-system/core';
import {
  AuthenticationService, Booking, BookingLocationRequest, Day,
  DayClickedEvent, Location, LocationChangedEvent,
  LocationDetailDTO, LocationService, ManagerCalendarService, MessageService,
  PlanService, PlatformService, SeatInvitedEvent, SelectionService,
  StaticDataService, TeamType, User, Week
} from '@flex-team/core';
import { DateTime } from 'luxon';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'underscore';
import { ModalGoogleMapComponent, ModalUserProfileComponent } from '../components';
import { ProcessingLocationService } from '../processing-location.service';

@Component({
  selector: 'fxt-plan-select-day',
  templateUrl: './plan-select-day.component.html',
  styleUrls: ['./plan-select-day.component.scss'],
})
export class PlanSelectDayComponent extends BaseSwiperCalendarComponent {

  @Output() dateChanged = new EventEmitter<DateTime>();

  public selectedDays: Day[] = [];
  public selectedDate: DateTime = DateTime.now();

  public locations: Location[] = [];
  public locationsWithoutArchive: Location[] = [];
  public selectableLocations: Location[] = [];

  public selectedLocationIds: string[] = [];

  public friendLocations:
    | { location: Location; bookings: Booking[]; mailTarget: string }[]
    | null = null;
  public numberOfFriends: number = 0;

  public set week(val: Week) {
    this._week = val;
    this.slides[this.pageIndex] = [val];
  }

  public get week(): Week {
    return this._week;
  }
  private _week: Week = new Week();

  private targetDate: DateTime;

  public modeManager = false;
  public currentUser: User;
  isWeekConfirmed = false;

  currentUserId: string;
  enableMap: boolean;
  rootAtWork: Location;

  initilized = false;

  private _destroyed = new Subject<void>();

  constructor(
    protected cd: ChangeDetectorRef,
    protected selectionService: SelectionService,
    private modalService: ModalService,
    private planService: PlanService,
    private staticDataService: StaticDataService,
    private locationService: LocationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private platformService: PlatformService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private processingLocationService: ProcessingLocationService,
    private managerCalendarService: ManagerCalendarService
  ) {
    super(cd, selectionService);

    this.currentUserId = this.authService.currentUser.id;
    this.modeManager = this.activatedRoute.snapshot.data.modeManager;

    this.centeredPageIndex = 26;
    this.maxNumberOfSlides = 52;
    this.pageIndex = this.centeredPageIndex;

    this.slides = Array.from({ length: this.maxNumberOfSlides }).map(
      (el, index) => []
    );

    this.enableMap = true;

    this.initTarget();

  }

  ngOnInit(): void {
    super.ngOnInit();
    this.getPossibleLocations();
    this.getSelectionBooking();
    this.authService.currentUser$.pipe(takeUntil(this._destroyed))
      .subscribe(data => {
        this.currentUser = data;
        this.cd.detectChanges();
      })
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  initTarget() {
    this.week = this.staticDataService.targetWeek;
    this.selectedDays = this.staticDataService.targetDay;
    this.currentDate = this.staticDataService.targetDate;
    this.targetDate = this.staticDataService.targetDate;
    this.selectedDate = DateTime.fromISO(this.selectedDays[0].dayDate);
  }

  openModalById(id: string) {
    const componentType = this.componentList[id];
    this.modalService.open(componentType, {});
  }

  paginateData = (index: number, updateCurrentView?: boolean) => {
    const target = this.targetDate.plus({
      weeks: index - this.centeredPageIndex,
    });

    const weekInMonth = Math.ceil((target.day - 1 - target.weekday) / 7);

    this.planService.getMonthStatus(target.year, target.month).subscribe(
      (data) => {
        if (!data.errorCode) {
          for (let i = 0; i < data.workload.length; i++) {
            this.slides[index + i - weekInMonth] = [data.workload[i]];
          }
          this.isWeekConfirmed = !data.workload[weekInMonth].days.some(timeslots => timeslots.some(x => !x.isConfirmed));
          this.updateChangesInView();

          if (updateCurrentView) {
            this.selectedDays = data.workload[weekInMonth].days.find(x => x[0].dayDate == this.selectedDays[0].dayDate);
            this.setSelectedLocations();
          } else {
            if (this.initilized) {
              this.onChangeDay({
                week: data.workload[weekInMonth],
                day: data.workload[weekInMonth].days[0],
                event: null
              });
            } else {
              this.initilized = true;
            }
          }

          this.cd.detectChanges();
        }
      }
    );
  };

  onChangeLocation($event: LocationChangedEvent) {
    this.saveLocationOrBookSeat($event);
  }

  setSelectedLocations() {
    const selectedLocationIds: string[] = [];
    this.selectedDays.forEach(x => {
      if (x != null && !selectedLocationIds.includes(x.selectedRemoteLocationId)) {
        selectedLocationIds.push(x.selectedRemoteLocationId);
      }
    });

    this.selectableLocations = this.locationsWithoutArchive;

    if (selectedLocationIds.length < 2) {
      this.selectableLocations = this.locationsWithoutArchive
        .filter(x => !selectedLocationIds.includes(x.id) || x.inOffice);
    }

    this.selectedLocationIds = selectedLocationIds;
  }

  onChangeDay(event: DayClickedEvent) {
    const { day, week } = event;
    this.week = week;
    this.selectedDays = day;

    this.setSelectedLocations();
    this.selectedDate = DateTime.fromISO(this.selectedDays[0].dayDate);

    this.getPossibleLocations();
    this.getSelectionBooking();

    this.dateChanged.emit(this.selectedDate);
    this.cd.detectChanges();
  }

  onSlideChange() {
    if (this.swiperCmp?.swiperRef != null) {
      this.pageIndex = this.activeIndex;

      this.currentDate = this.targetDate.plus({
        weeks: this.pageIndex - this.centeredPageIndex,
      });

      this.month = this.currentDate.toFormat('LLLL');
      this.year = this.currentDate.year.toString();

      this.activeDayInCalendar =
        this.pageIndex == this.centeredPageIndex ? DateTime.now().day : 0;

      this.paginateData(this.pageIndex, false);
    }
  }

  onGetToday(): void {
    const delta = DateTime.now().weekNumber - this.targetDate.weekNumber;
    this.swiperCmp?.swiperRef.slideTo(this.centeredPageIndex + delta);
    this.centerToDate(new Date());
  }

  goToPlan() {
    const options = this.modeManager ? {
      relativeTo: this.activatedRoute
    } : {};
    this.router.navigate(['./plan'], options)
  }


  /**
   * Confirm days clicked handler
   * @param user 
   * @param dayIndex 
   */
  onConfirmDaysClicked($event: any) {
    if (!this.isWeekConfirmed) {
      const dates = this.staticDataService.getDatesOfWeekForGivenDate(this.currentDate, {
        includeWeekend: false,
        long: false
      });
      this.managerCalendarService.confirm(this.currentUser.id, dates[0], dates[dates.length - 1])
        .subscribe((resp) => {
          if (!resp.errorCode) {
            this._reloadWeekStatus();
          }
        });
    }
  }

  showModalGoogleMap() {
    const modalRef = this.modalService.open(ModalGoogleMapComponent, {
      height: '90%',
      data: {
        selectedDate: this.selectedDate.toJSDate()
      }
    });

    modalRef.afterClosed$.subscribe(_ => {
    })
  }

  private getPossibleLocations() {
    const from = new Date(this.selectedDays[0].dayDate);
    const to = new Date(this.selectedDays[0].dayDate);
    this.locationService.getLocationsBetweenDate(from, to).subscribe(
      (resp) => {
        this.rootAtWork = resp.workload.find(x => x.inOffice && x.idParentLocation == null);
        this.locations = this.locationService.flattenLocations(resp.workload);
        this.locationsWithoutArchive = this.locationService.flattenLocationsAndHideArchived(resp.workload);
        this.setSelectedLocations();
      }
    );
  }

  private getSelectionBooking() {
    const from = new Date(this.selectedDays[0].dayDate);
    const to = new Date(this.selectedDays[0].dayDate);
    this.selectionService
      .getSelectionBooking(from, to, TeamType.Undefined)
      .subscribe((dataInternal) => {
        if (!dataInternal.errorCode) {
          this._retrieveFriendLocations(dataInternal.workload);
        }
      });
  }

  private _retrieveFriendLocations(workload: Booking[]) {
    this.friendLocations = _.chain(workload)
      .groupBy((l) => l.location && l.location.name)
      .map((value, key) => ({
        location: value[0].location,
        bookings: value,
        mailTarget: value.map((x) => x.user?.email).join(';'),
      }))
      .filter(x => x.location != null)
      .value();
    this.numberOfFriends = workload.length;
  }

  private saveLocationOrBookSeat($event: LocationChangedEvent) {

    const location = {
      target: $event.location.id,
      targetLocation: $event.location,
      seatId: $event.seat?.id,
      doLeave: $event.doLeave,
      metadataValues: $event.metadataValues,
      timeslotId: $event.timeslotId
    } as LocationDetailDTO;

    const request: BookingLocationRequest = {
      modeHalfDay: $event.modeHalfDay,
      userId: $event.userId || this.authService.currentUser.id,
      date: this.selectedDate.toJSDate(),
      dayIndex: 0,
      locations: [location]
    } as BookingLocationRequest;

    const targetUserIsCurrent = $event.userId === this.authService.currentUser.id;

    this.processingLocationService.trySaveLocationOrBookSeat(request, {
      name: this.authService.currentUser.coreTeamName
    }).subscribe(resp => {
      if (!resp.errorCode) {
        if (resp.workload != null) {
          if (targetUserIsCurrent) {
            if (!$event.doLeave && !$event.modeHalfDay && !$event.seat) {
              if (!$event.seat) {
                this.week = resp.workload as any;
                const days = (resp.workload as any).days.filter(
                  (c: any) => c[0].dayDate == this.selectedDays[0].dayDate
                );
                this.selectedDays = days[0];
                this.setSelectedLocations();
              }
            } else {
              this._reloadWeekStatus();
            }
          }
          this.getPossibleLocations();
          this.messageService.success();
          this.cd.detectChanges();
        }
      } else {
        this.messageService.error(`message_error.${resp.errorCode}`);
      }
    })

  }

  private _reloadWeekStatus() {
    this.paginateData(this.pageIndex, true);
  }

  onQuickPlayChanged() {
    this._reloadSelectionBooking();
  }

  private _reloadSelectionBooking() {
    this.getSelectionBooking();
  }

  centerToDate(dateJs: Date) {
    let target = DateTime.fromJSDate(dateJs);

    const isWorkingDay = target.weekday !== 6 && target.weekday !== 7;

    if (!isWorkingDay) {
      target = target.plus({ days: 8 - target.weekday });
    }

    const targetData$ = [
      this.planService.getDayStatus(target.year, target.month, target.day),
      this.planService.getMonthStatus(target.year, target.month)
    ];

    return forkJoin(targetData$).subscribe(([targetDay, targetWeek]) => {
      const weekInMonth = Math.ceil((target.day - 1 - target.weekday) / 7);
      const day = targetDay.workload as Day[];
      const week = (<Week[]>targetWeek.workload)[weekInMonth] as Week;
      this.onChangeDay({ day, week, event: null });
    });
  }

  openUserProfilePopup(user: User) {
    //TODO: to discuss if we need this function for mobile
    if (this.platformService.isMobile(window)) return;
    this.modalService.open(ModalUserProfileComponent, {
      width: '550px',
      maxHeight: '85%',
      customClass: 'modal-user-profile',
      data: {
        user: user
      },
    });
  }

  /**
  * `Output Binding` Invite seat
  * @param $event 
  */
  onSeatInvited($event: SeatInvitedEvent) {
    this.inviteSeat($event);
  }

  /**
  * `Call API` invite seat
  * @param $event 
  */
  private inviteSeat($event: SeatInvitedEvent) {
    this.planService.inviteSeat($event).subscribe(resp => {
      if (!resp.errorCode) {
        if (resp.workload != null) {
          this.messageService.success();
        }
      }
    })
  }
}
