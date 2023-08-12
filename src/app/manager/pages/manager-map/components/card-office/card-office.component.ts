import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import {
  AuthenticationService,
  Floor, ManagerMapViewService, ManagerOfficeService, OccupationBuildingDTO,
  OccupationRuleItem, OccupationType, Office,
  OfficeClickedEvent,
  StaticDataService, TimeSlotTemplateDTO, User,
  UserPresenceByTimeslotDto, UserPresenceDto, UserPresenceInfo, UserSeat, Workload
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { DateTime } from 'luxon';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'fxt-manager-map-card-office',
  templateUrl: './card-office.component.html',
  styleUrls: ['./card-office.component.scss'],
  host: {
    '[class.selected]': 'selected',
    '[class.disabled]': 'disableBook',
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardOfficeComponent implements OnInit, OnChanges, OnDestroy {

  @Input() floor: Partial<Floor>;
  @Input() office: Office;
  @Input() selectedDate: Date;
  @Input() currentUser: User;
  @Input() isDeskBookingEnabled: boolean;
  @Input() isFloatingReservationsEnabled: boolean;
  @Input() userSeats: UserSeat[];
  @Input() occupationState: OccupationBuildingDTO;
  @Input() timeslotTemplates: TimeSlotTemplateDTO[];
  @Input() halfDayEnabled = false;

  @Output() officeClicked = new EventEmitter<OfficeClickedEvent>();
  @Output() inviteClicked = new EventEmitter<Office>();
  @Output() userClicked = new EventEmitter<User>();

  confirmedUsers: UserPresenceByTimeslotDto[];
  unconfirmedUsers: UserPresenceDto[];
  overflowUsers: UserPresenceDto[];

  highlightUserIds: string[] = [];
  isReservedForOthersOrBlocked = false;

  highlightUserIdsObj: { [key: string]: boolean } = {};

  loading = false;
  doCurrentUserBookThisOffice = false;
  doCurrentUserHaveASeatOnThisOffice = false;
  isEquipmentCollapsed = true;
  isRuleCollapsed = true;
  occupationRules: OccupationRuleItem[];

  OccupationTypeEnum = OccupationType;

  overloaded = false;
  canBookViaOffice = true;
  disableBook = false;
  modeHalfDay = false;
  timeSlots: { id: string, label: string }[];
  timeSlotTemplatesByDay: TimeSlotTemplateDTO[];

  selectedStatesByTimeslot: Map<string, boolean> = new Map();

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private managerOfficeService: ManagerOfficeService,
    private managerMapViewService: ManagerMapViewService,
    private staticDataService: StaticDataService,
    private authService: AuthenticationService,
    private modalService: ModalService,
    private translocoService: TranslocoService,
    private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.managerMapViewService.highlightUserIds$
      .pipe(takeUntil(this._destroyed))
      .subscribe((data) => {
        this.highlightUserIds = data;
        this.highlightUserIdsObj = {};
        this.highlightUserIds.forEach(k => this.highlightUserIdsObj[k] = true);
        if (this.unconfirmedUsers) {
          this.sortUsers();
        }
        this.cd.detectChanges();
      });

    this.onHalfDayChanged();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.userSeats && this.userSeats) {
      const userSeatOfCurentUser = this.userSeats.find(x => x.user.id === this.currentUser.id
        && this.office.id === x.locationId);

      this.doCurrentUserBookThisOffice = userSeatOfCurentUser != null;
      this.doCurrentUserHaveASeatOnThisOffice = userSeatOfCurentUser != null
        && userSeatOfCurentUser.seatId != null;

      this.loadUsersForOffice();
    }

    if (changes.occupationState && changes.occupationState.currentValue) {
      const occupationFloor = this.occupationState.floors.find(x => x.id == this.floor.id);
      if (occupationFloor) {
        const occupationOffice = occupationFloor.offices.find(x => x.id === this.office.id);
        if (occupationOffice) {
          this.occupationRules = occupationOffice.block.users
            .concat(occupationOffice.block.teams)
            .concat(occupationOffice.reserve.users)
            .concat(occupationOffice.reserve.teams);

          const isUserBlocked = occupationOffice.block.allUserIds.length > 0 && occupationOffice.block.allUserIds.includes(this.currentUser.id);
          const reservedForOthers = occupationOffice.reserve.allUserIds.length > 0 && !occupationOffice.reserve.allUserIds.includes(this.currentUser.id);
          this.isReservedForOthersOrBlocked = (isUserBlocked || reservedForOthers) ? true : false;
        }
      }
    }

    if (changes.selectedDate && this.selectedDate) {
      this.timeSlotTemplatesByDay = this.timeslotTemplates.filter(x => x.dayOfWeek === DateTime.fromJSDate(this.selectedDate).weekday)
    }

    this.checkCanBook();
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  onOfficeClicked(timeslotIndex: number | null) {
    const timeslot = timeslotIndex != null ? this.timeSlotTemplatesByDay[timeslotIndex] : null;
    const selected = timeslotIndex != null ? this.selectedStatesByTimeslot.get(timeslot.id) : this.doCurrentUserBookThisOffice;
    if (this.canBookViaOffice && !selected && !this.loading) {
      this.officeClicked.emit({
        office: this.office,
        timeslotId: timeslot?.id,
        modeHalfDay: this.modeHalfDay,
        doLeave: false
      });
    }
  }

  onInviteClicked() {
    this.inviteClicked.emit(this.office);
  }

  onAvatarClicked(user: User, event: any) {
    event.preventDefault();
    event.stopPropagation();

    if (this.isDeskBookingEnabled) {
      this.managerMapViewService.clickedUserId = user.id;
    } else {
      this.userClicked.emit(user);
    }
  }

  onOfficeNameClicked() {
    if (this.isDeskBookingEnabled) {
      this.managerMapViewService.highlightSeatIds = this.office.seats.map(x => x.id);
    }
  }

  onHalfDayChanged() {
    this.timeSlots = this.staticDataService.factoryTimeslotOptions(this.timeSlotTemplatesByDay, this.modeHalfDay);
  }

  trackByFn(_: number, user: any): string {
    return user.id;
  }

  onButtonLeaveClicked() {
    this.showModalConfirmation();
  }

  private showModalConfirmation() {
    const isCurrentUser = this.authService.currentUser?.id === this.currentUser.id;
    const message = !isCurrentUser
      ? this.translocoService.translate('main.remove_user_name_from_the_desk', {
        username: this.currentUser.fullName
      }) : this.translocoService.translate('main.leave_from_the_desk_himself');

    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: '400px',
      disableClose: true,
      customClass: 'modal-confirmation',
      data: {
        message,
      }
    });

    modalRef.afterClosed$.subscribe(ok => {
      if (ok) {
        this.officeClicked.emit({
          office: this.office,
          timeslotId: null,
          modeHalfDay: this.modeHalfDay,
          doLeave: true
        });
      }
    })
  }

  /**
   * Load users presence of office
   */
  private loadUsersForOffice() {
    this.loading = true;
    this.managerOfficeService.loadUsersForOffice(this.office.id, DateTime.fromJSDate(this.selectedDate))
      .pipe(finalize(() => {
        this.loading = false;
        this.cd.detectChanges();
      })).subscribe((resp: Workload<UserPresenceInfo>) => {
        const info: UserPresenceInfo = resp.workload;

        ({
          unconfirmed: this.unconfirmedUsers,
          overflow: this.overflowUsers,
          confirmed: this.confirmedUsers
        } = info);

        this.managerMapViewService.officeUsers = {
          ...this.managerMapViewService.officeUsers,
          [this.office.id]: this.confirmedUsers
        };

        this.office.actualLoad = info.allUsers.length;

        this.selectedStatesByTimeslot = new Map();
        info.confirmed.forEach(item => {
          this.selectedStatesByTimeslot.set(item.timeslotId, item.users.findIndex(x => x.id == this.currentUser.id) >= 0);
        });

        this.checkCanBook();
      })
  }

  /**
   * Sort lists users
   */
  private sortUsers() {
    this.confirmedUsers = this.confirmedUsers.map(x => {
      return {
        timeslotId: x.timeslotId,
        users: x.users.sort(this.sortByFn)
      }
    });
    this.unconfirmedUsers = this.unconfirmedUsers.sort(this.sortByFn);
  }

  /**
   * SortBy function
   * @param a 
   * @param b 
   * @returns 
   */
  private sortByFn = (a: UserPresenceDto, b: UserPresenceDto) => {
    const foundA = this.highlightUserIds.indexOf(a.id) >= 0;
    const foundB = this.highlightUserIds.indexOf(b.id) >= 0;
    if (foundA) return -1;
    if (foundB) return 1;
    return 0;
  }

  /**
   * Check if user can book
   * IF the office overbooking option is activated in the organization page
   *   THEN:  If there is no desk booking, simply keep the button "book" even when the max capacity is reached
   *          If there is desk booking on a map, then show the book button in the card once all the desks are booked
   */
  private checkCanBook() {

    if (this.office) {
      this.overloaded = this.office.actualLoad >= this.office.capacity;
    }

    if (this.isReservedForOthersOrBlocked) {
      // If office is reserved for others or block current user, hide button, disable totally booking
      this.canBookViaOffice = false;
      this.disableBook = true;
    } else {
      if (this.overloaded) {
        // If overloaded
        if (this.isFloatingReservationsEnabled) {
          // If floating reservation is enabled on floor
          this.disableBook = false;
          this.canBookViaOffice = true;

        } else {
          // If floating reservation is disabled
          this.canBookViaOffice = false;
          this.disableBook = true;
        }
      } else {
        // If NOT overloaded
        this.disableBook = false;
        if (this.isDeskBookingEnabled) {
          // If deskbooking enabled, hide the button book
          this.canBookViaOffice = false;
        } else {
          // If deskbooking disabled, show the button book
          this.canBookViaOffice = true;
        }
      }
    }

  }

}
