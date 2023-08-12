import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ModalMetadataValuesComponent,
  ModalService
} from '@design-system/core';
import {
  AuthenticationService, BookingLocationRequest, CalendarDayFilter, Day,
  IMetadataItem, IMetadataValue, Location,
  LocationChangedEvent, LocationChangedEventWithTrigger, LocationChangedTrigger, LocationDetailDTO,
  LocationInfoEvent,
  LocationService,
  Location_Non_Defined_Name,
  ManagerCalendarService, ManagerFilter, ManagerMapViewService, ManagerSort,
  ManagerTeamData,
  ManagerUserData,
  MessageService,
  moveItemToFirstById, PlanService, SeatInfoEvent, SelectionGroups,
  StaticDataService, TimeSlotTemplateDTO, User,
  UserRole,
  WeeklySearchChartData,
  WeeklySearchChartDataPayload
} from '@flex-team/core';
import { DateTime } from 'luxon';
import { Observable, Subject } from 'rxjs';
import { finalize, skip, takeUntil } from 'rxjs/operators';
import { ProcessingLocationService } from 'src/app/processing-location.service';
import { ManagerMapDetailComponent } from '../manager-map/components';
import { ManagerCalendarFilterService } from './services';

@Component({
  selector: 'app-manager-calendar',
  templateUrl: './manager-calendar.component.html',
  styleUrls: ['./manager-calendar.component.scss'],
})
export class ManagerCalendarComponent implements OnInit, OnDestroy {
  public todayDay: Date = new Date();

  public teams: Array<ManagerTeamData> = [];
  public data: Array<ManagerUserData> = [];
  public sortedData: Array<ManagerUserData> = [];

  public days: CalendarDayFilter[] = [];

  loading: boolean = false;

  public locations: Location[] = [];
  private lastFilterValue: ManagerFilter;

  weeklySearchCharts: WeeklySearchChartData[];

  sortObj: ManagerSort;
  currentUser: User;

  halfDayEnabled = false;
  timeslotTemplates: TimeSlotTemplateDTO[];
  isMapDetailDisplayed = false;

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private managerCalendarService: ManagerCalendarService,
    private managerFilterService: ManagerCalendarFilterService,
    private managerMapViewService: ManagerMapViewService,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private staticDataService: StaticDataService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private planService: PlanService,
    private router: Router,
    private processingLocationService: ProcessingLocationService,
    private locationService: LocationService,
  ) {
    this.halfDayEnabled = this.authService.IsHalfDaysEnabled;
    this.timeslotTemplates = this.authService.timeSlotTemplates;
  }

  ngOnInit(): void {

    this.managerFilterService.filters$
      .pipe(takeUntil(this._destroyed), skip(1)).subscribe((filter) => {
        this.lastFilterValue = filter;
        this.days = this.managerFilterService.days;
        if (!this.isMapDetailDisplayed) {
          this.reload();
        }
      });

    this.managerFilterService.sort$.pipe(takeUntil(this._destroyed)).subscribe((sortObj) => {
      this.sortObj = sortObj;
      this.sortedData = this.sortData(this.data, sortObj);
      this.cd.detectChanges();
    });

    this.authService.currentUser$.pipe(takeUntil(this._destroyed))
      .subscribe(data => {
        this.currentUser = data;
        this.cd.detectChanges();
      });

    this.staticDataService.locationChanged$
      .pipe(takeUntil(this._destroyed))
      .subscribe(payload => {
        switch (payload.trigger) {
          case LocationChangedTrigger.Calendar:
            this.trySaveLocationOrBookSeat(payload);
            break;
          default: break;
        }

      })

    this.staticDataService.userProfileChanged$
      .pipe(takeUntil(this._destroyed))
      .subscribe(payload => {
        if (payload) {
          this.reload();
        }
      });

    this.staticDataService.isModalMapDetailDisplayed$
      .pipe(takeUntil(this._destroyed))
      .subscribe(val => {
        this.isMapDetailDisplayed = val;
      });


  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  /**
   * Display modal map detail
   * @param $event 
   */
  private displayModalMapDetail($event: LocationChangedEvent) {
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
      if (resp != null) {
        this.onSuccessBookingLocation(resp, $event);
      }
    });
  }

  /**
   * Show modal map detail when location office is clicked
   * @param $event 
   */
  onLocationOfficeClicked($event: LocationChangedEvent) {
    this.displayModalMapDetail($event);
  }

  /**
   * Confirm days clicked handler
   * @param user 
   * @param dayIndex 
   */
  onConfirmDaysClicked(user: ManagerUserData, $event: LocationInfoEvent) {
    this.confirm(user, $event);
  }

  onSeatClicked(user: ManagerUserData, $event: SeatInfoEvent) {
    const day = user.days[$event.dayIndex][$event.timeslotIndex];
    try {
      const office = this.staticDataService.findLocationById(this.locations, day.selectedRemoteLocationId);
      const floor = this.staticDataService.findLocationById(this.locations, office.idParentLocation);
      const building = this.staticDataService.findLocationById(this.locations, floor.idParentLocation);
      this.router.navigate([`./manager/plan/${building.id}`], {
        state: {
          floor: floor,
          office: office,
          seatId: day.selectedRemoteSeatId,
          userId: user.id,
          date: day.dayDate
        }
      });
      this.managerMapViewService.clickedUserId = user.id;
    } catch (e: any) {
      console.warn('Unable to find building');
    }

  }

  /**
   * Force reload locations
   */
  private reload() {
    this.getLocationsByFilter(this.lastFilterValue);
    this.getPossibleLocations(this.lastFilterValue);
  }

  private confirm(user: ManagerUserData, $event: LocationInfoEvent) {
    const startDate = $event != null ? $event.locations[$event.timeslotIndex].date
      : this.lastFilterValue.start;
    const endDate = $event != null ? startDate : this.lastFilterValue.end;

    this.managerCalendarService.confirm(user.id, startDate, endDate).subscribe((resp) => {
      if (!resp.errorCode) {
        const updatedUser = Object.assign({}, user, {
          isWeekConfirmed: true,
          days: resp.workload
        });

        this.teams[user.teamIndex].users[user.userIndex] = updatedUser;

        this._treatData(this.teams);
        this.messageService.success();
      }

    })
  }

  sortData(data: ManagerUserData[], sortObj: ManagerSort): ManagerUserData[] {

    if (!sortObj.name) return [...data];

    //TODO: To sort, we base only on first timeslot for now
    const timeslotIndex = 0;
    const currentUser = data.find(x => x.id == this.authService.currentUser.id);

    const arr = data.filter(x => x.id !== this.authService.currentUser.id)
      .sort((a: ManagerUserData, b: ManagerUserData) => {

        const locA = a.days[sortObj.dayIndex][timeslotIndex];
        const locB = b.days[sortObj.dayIndex][timeslotIndex];

        if (locA.selectedRemoteLocation == sortObj.name
          && locB.selectedRemoteLocation == sortObj.name) {
          if (a.teamIndex > b.teamIndex) return 1;
          if (a.teamIndex < b.teamIndex) return -1;
          else return a.userIndex - b.userIndex;
        }
        if (locA.selectedRemoteLocation == sortObj.name) return -1;
        if (locB.selectedRemoteLocation == sortObj.name) return 1;
        return 0;
      })

    arr.unshift(currentUser)

    return arr;
  }

  trackByFn(index: number, item: any): string {
    return item.id;
  }

  private trySaveLocationOrBookSeat(payload: LocationChangedEventWithTrigger) {

    const $events = payload.modeHalfDay ? payload.events : [payload.events[0]];

    const { date, teamIndex, user } = this.extractInfoFromLocationChangedEvent($events[0]);

    const locations: LocationDetailDTO[] = $events.map(x => <LocationDetailDTO>{
      target: x.location.id,
      targetLocation: x.location,
      timeslotId: x.timeslotId,
      seatId: x.seat?.id,
      doLeave: x.doLeave,
      metadataValues: x.metadataValues
    });

    const request = {
      date: date.toJSDate(),
      locations: locations,
      userId: user.id,
      modeHalfDay: payload.modeHalfDay
    } as BookingLocationRequest;

    this.processingLocationService.trySaveLocationOrBookSeat(request, {
      name: this.teams[teamIndex].name
    })
      .subscribe(resp => {
        if (!resp.errorCode) {
          if (resp.workload != null) {
            this.onSuccessBookingLocation(resp, $events[0]);
          }
        } else {
          this.messageService.error(`message_error.${resp.errorCode}`);
        }
      })
  }

  /**
   * Booking location on success
   * @param resp 
   * @param user 
   * @param teamIndex 
   * @param userIndex 
   * @param dayIndex 
   */
  private onSuccessBookingLocation(resp: any, event: LocationChangedEvent) {

    const { date, teamIndex, user, userIndex, dayIndex } = this.extractInfoFromLocationChangedEvent(event);

    const timeslotIndexWithSeat = this.timeslotTemplates.filter(x => x.dayOfWeek === dayIndex + 1)
      .findIndex(x => x.id === resp.workload.timeslotId);

    let newDays = [];
    if (timeslotIndexWithSeat >= 0) {
      const target: Day = this.teams[teamIndex].users[userIndex].days[dayIndex][timeslotIndexWithSeat];
      user.days[dayIndex][timeslotIndexWithSeat] = Object.assign({}, target, resp.workload);
      user.days[dayIndex] = [...user.days[dayIndex]];
      newDays = [...user.days];
    } else {
      newDays = resp.workload.days;
    }

    this.teams[teamIndex].users[userIndex] = Object.assign({}, user, {
      days: newDays as Day[],
    });

    this._treatData(this.teams);

    this.getPossibleLocations(this.lastFilterValue);
    this.messageService.success();
  }

  private getLocationsByFilter(filter: ManagerFilter) {
    const forAllCompany = filter.selection.findIndex(x => x.group === SelectionGroups.AllCompany) >= 0;
    const forFavorites = filter.selection.findIndex(x => x.group === SelectionGroups.Favorites) >= 0;
    if (forAllCompany) {
      this.getLocationsWholeCompany(filter);
    } else if (forFavorites) {
      this.getLocationsForFavorites(filter);
    } else {
      this.loadLocations(filter);
    }
  }

  /**
   * Load locations
   * @param filter 
   */
  private loadLocations(filter: ManagerFilter) {
    this.loading = true;
    this.managerCalendarService
      .getLocations(filter)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (data) => {
          this._treatData(data.workload);
        }
      );
  }

  private getLocationsWholeCompany(filter: ManagerFilter) {
    this.loading = true;
    this.managerCalendarService
      .getLocationsWholeCompany(filter)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(data => {
        this._treatData(data.workload);
      })
  }

  private getLocationsForFavorites(filter: ManagerFilter) {
    this.loading = true;
    this.managerCalendarService
      .getLocationsForFavorites(filter)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(data => {
        this._treatData(data.workload);
      })
  }

  private _treatData(data: ManagerTeamData[]) {
    this.teams = moveItemToFirstById(data, this.authService.currentUser.id);
    this.data = this.constructData(this.teams);
    this.weeklySearchCharts = this.retrieveWeeklyChartData(data);
    this.managerFilterService.resetSort();
    this.cd.detectChanges();
  }

  private constructData(teams: ManagerTeamData[]): Array<ManagerUserData> {
    const data: ManagerUserData[] = [];
    const isHRManager = this.authService.currentUserHasRole(UserRole.HRManager);
    const isOfficeManager = this.authService.currentUserHasRole(UserRole.OfficeManager);
    teams.forEach((team: ManagerTeamData, teamIndex: number) => {
      team.users.forEach((user: ManagerUserData, userIndex: number) => {
        user.teamIndex = teamIndex;
        user.userIndex = userIndex;
        user.team = team;
        const isCurrentUser = teamIndex == 0 && userIndex == 0;
        const isOwnerOfCoreTeam = team.isHierarchy && team.ownerId == this.authService.currentUser.id;

        user.canEdit = isCurrentUser || isOwnerOfCoreTeam || isHRManager || isOfficeManager;
        user.isWeekConfirmed = this.staticDataService.isWeekConfirmed(user.days);
        data.push(user);
      })
    })
    return data;
  }

  private getPossibleLocations(filter: ManagerFilter) {
    const from = filter.start.toJSDate();
    const to = filter.start.plus({ days: 4 }).toJSDate();
    this.locationService.getLocationsBetweenDate(from, to).subscribe(
      (l) => {
        this.locations = l.workload.filter(x => x.archived === false);
      }
    );
  }

  private retrieveWeeklyChartData(teams: ManagerTeamData[]): WeeklySearchChartData[] {

    //TODO: for now, just check first time slot
    const timeslotIndex = 0;

    const res: WeeklySearchChartData[] = [];

    this.days.forEach(_ => res.push(<WeeklySearchChartData>{
      total: 0,
      payload: []
    }));

    let total = 0;
    for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
      const users = teams[teamIndex].users;
      total += users.length;

      for (let i = 0; i < users.length; i++) {
        const days = users[i].days;
        for (let dayIndex = 0; dayIndex < days.length; dayIndex++) {
          const day = days[dayIndex][timeslotIndex];

          if (day.selectedRemoteLocation == Location_Non_Defined_Name)
            continue;

          const found = res[dayIndex].payload.find((x: any) => x.name == day.selectedRemoteLocation);
          if (!found) {
            res[dayIndex].payload.push({
              name: day.selectedRemoteLocation,
              orderInList: day.orderInList,
              value: 1,
              color: day.color
            } as WeeklySearchChartDataPayload);
          } else {
            found.value++;
          }

        }
      }
    }

    res.forEach(item => item.total = total);
    return res;
  }

  public showMetadataDialog($events: LocationInfoEvent) {
    const $event = $events.locations[$events.timeslotIndex];
    const dayInfo = $events.dayInfos[$events.timeslotIndex];

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

  /**
   * Call API: Update metadatavalues
   * @param $events 
   * @param metadataValues 
   * @returns 
   */
  private updateMetadataValues($events: LocationInfoEvent, metadataValues: IMetadataValue[]) {

    return this.planService.updateMetadataValues(metadataValues).subscribe(resp => {
      if (!resp.errorCode) {
        const $event: LocationChangedEvent = $events.locations[$events.timeslotIndex];
        const { teamIndex, userIndex, dayIndex } = this.extractInfoFromLocationChangedEvent($event);
        const user = this.teams[teamIndex].users[userIndex];
        const day = user.days[dayIndex][$events.timeslotIndex];
        user.days[dayIndex][$events.timeslotIndex] = { ...day, metadataValues: [...metadataValues] };
        user.days[dayIndex] = [...user.days[dayIndex]];

        this.teams[teamIndex].users[userIndex] = Object.assign({}, user, {
          days: [...user.days] as Day[][],
        });

        this._treatData(this.teams);
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

  /**
   * Extract location, teamIndex, userIndex, dayIndex
   * @param $event 
   * @returns 
   */
  private extractInfoFromLocationChangedEvent($event: LocationChangedEvent): {
    date: DateTime,
    location: Location,
    teamIndex: number,
    userIndex: number,
    user: ManagerUserData,
    dayIndex: number
  } {
    const { userId, date, location } = $event;

    const teamIndex = this.teams.findIndex(x => x.users.findIndex(x => x.id === userId) >= 0);
    const userIndex = this.teams[teamIndex].users.findIndex(x => x.id === userId);
    const user = this.teams[teamIndex].users[userIndex];
    const dayIndex = date.weekday - 1;

    return { date, location, teamIndex, user, userIndex, dayIndex }
  }


}
