import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter,
  Input,
  OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild
} from '@angular/core';
import {
  CheckboxComponent,
  ModalService
} from '@design-system/core';
import {
  AuthenticationService, CalendarDayFilter, Day, HierarchyLevel,
  Location, LocationChangedEvent, LocationChangedTrigger, LocationInfoEvent,
  ManagerUserData, MessageService, SeatInfoEvent, SelectionItem,
  SelectionType, TimeSlotTemplateDTO,
  User
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { DateTime } from 'luxon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModalUserProfileComponent } from 'src/app/components';
import { ManagerCalendarFilterService } from '../../services';

@Component({
  selector: 'fxt-manager-user-row',
  templateUrl: './user-row.component.html',
  styleUrls: ['./user-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagerUserRowComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('checkboxConfirmWeek') checkboxConfirmWeekCmp: CheckboxComponent;

  @Output() locationChanged: EventEmitter<LocationChangedEvent[]> = new EventEmitter<LocationChangedEvent[]>();
  @Output() confirmDaysClicked: EventEmitter<LocationInfoEvent> = new EventEmitter<LocationInfoEvent>();
  @Output() seatClicked: EventEmitter<SeatInfoEvent> = new EventEmitter<SeatInfoEvent>();
  @Output() locationInfoClicked: EventEmitter<LocationInfoEvent> = new EventEmitter<LocationInfoEvent>();
  @Output() locationOfficeClicked: EventEmitter<LocationChangedEvent> = new EventEmitter<LocationChangedEvent>();

  @Input() user: ManagerUserData = new ManagerUserData();
  @Input() canEdit: boolean;
  @Input() locations: Location[] = [];
  @Input() buildings: Location[] = [];
  @Input() currentUser: User;
  @Input() days: CalendarDayFilter[] = [];
  @Input() halfDayEnabled: boolean;

  public HierarchyLevelEnum = HierarchyLevel;
  public LocationChangedTriggersEnum = LocationChangedTrigger;

  currentSort: string;
  currentSortIndex: number = 0;

  isCurrentUser: boolean;
  isMeOrInMyTeam: boolean;
  isWeekConfirmed: boolean

  selectionItem: SelectionItem = null;
  private _destroyed = new Subject<void>();

  textWeekIsConfirmed: string;
  textConfirmWholeWeek: string;
  timeSlotTemplates: TimeSlotTemplateDTO[];

  constructor(
    private authService: AuthenticationService,
    private managerFilterService: ManagerCalendarFilterService,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private messageService: MessageService,
    private translocoService: TranslocoService
  ) {
    this.timeSlotTemplates = this.authService.timeSlotTemplates;
  }

  ngOnInit() {
    this.textConfirmWholeWeek = this.translocoService.translate('manager.confirm_whole_week');
    this.textWeekIsConfirmed = this.translocoService.translate('manager.week_is_confirmed');

    if (this.authService.currentUser?.id !== this.user.id) {
      this.managerFilterService.sort$.pipe(takeUntil(this._destroyed))
        .subscribe(sortObj => {
          this.currentSort = sortObj.name;
          this.currentSortIndex = sortObj.dayIndex;
          this.cd.detectChanges();
        })
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user != null) {
      this.isCurrentUser = this.authService.currentUser?.id === this.user.id;
      this.selectionItem = this.getSelectionItem(changes.user.currentValue);
      this.isWeekConfirmed = this.user.isWeekConfirmed;
    }
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  trackbyFn(index: number, item: any) {
    return item.selectedRemoteLocation;
  }

  private getSelectionItem(user: ManagerUserData): SelectionItem {
    const item = new SelectionItem();
    item.id = user.team.id;
    item.name = user.team.name;
    item.isHierarchy = user.team.isHierarchy;
    item.isPrefered = user.team.isPrefered;
    item.isSocial = user.team.isSocial;
    item.type = SelectionType.Team;

    return item;
  }

  onLocationChanged(events: LocationChangedEvent[]) {
    const dto: LocationChangedEvent[] = events.map(x => <LocationChangedEvent>{
      teamId: this.user.team.id,
      ...x
    })
    this.locationChanged.emit(dto);
  }

  onConfirmDaysClicked($event: LocationInfoEvent) {
    const dateToConfirm = $event != null ? $event.locations[$event.timeslotIndex].date
      : this.managerFilterService.filter.start;

    const dayIndex = dateToConfirm.weekday - 1;
    const locationsOfDay = this.user.days[dayIndex];

    const isConfirmed = $event != null ? locationsOfDay[$event.timeslotIndex].isConfirmed
      : this.user.isWeekConfirmed;

    if (!isConfirmed) {
      if (this.checkCanConfirmWeeksOrDays(dateToConfirm)) {
        this.confirmDaysClicked.emit($event);
      } else {
        this.messageService.error('notifications.limit_booking.title', {
          limitValue: this.authService.limitBookingInFuture
        });
        this.isWeekConfirmed = false;
      }
    }
  }

  onSeatClicked($event: SeatInfoEvent) {
    this.seatClicked.emit($event)
  }


  openUserProfilePopup(user: ManagerUserData) {

    this.modalService.open(ModalUserProfileComponent, {
      width: '550px',
      maxHeight: '85%',
      customClass: 'modal-user-profile',
      data: {
        user: user
      },
    });
  }

  onLocationInfoClicked($event: LocationInfoEvent, day: Day[]) {
    $event.dayInfos = day;
    this.locationInfoClicked.emit($event);
  }

  onLocationOfficeClicked($event: LocationChangedEvent, day: Day[]) {
    $event.teamId = this.user.team.id;
    this.locationOfficeClicked.emit($event);
  }

  isDayConfirmed(day: Day[]): boolean {
    return !day.some(x => !x.isConfirmed);
  }

  private checkCanConfirmWeeksOrDays(startDate: DateTime): boolean {
    const limitBookingInFuture = this.authService.limitBookingInFuture;
    const limitDate = DateTime.now().plus({ weeks: limitBookingInFuture })
    return limitDate.valueOf() >= startDate.valueOf();
  }


}
