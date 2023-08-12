import {
  Component, EventEmitter, HostBinding, Input,
  OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild
} from '@angular/core';
import {
  Day,
  Location_Non_Defined_Name,
  OccupationRuleItem, OccupationType, Seat,
  SeatBookedEvent, SeatInvitedEvent, StaticDataService,
  TimeSlotStateOfSeat, TimeSlotTemplateDTO, User
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { Observable, Subject } from 'rxjs';
import _ from 'underscore';
import { ModalConfirmationComponent, ModalService } from '../modal';

const LIMIT_HALFDAY = 2;

@Component({
  selector: 'fxt-seat',
  templateUrl: './seat.component.html',
  styleUrls: ['./seat.component.scss'],
  host: {
    '[class.booked]': '_booked',
    '[class.disabled]': 'disableBook',
    '[class.search]': 'search'
  }
})
export class SeatComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChild('pop') popoverRef: PopoverDirective;

  @Input() seat: Seat;
  @Input() disableBook = false;
  @Input() occupationRules: OccupationRuleItem[];
  @Input() modeBook = true;
  @Input() modeEdit = false;
  @Input() halfDayEnabled = false;
  @Input() currentUser: User;
  @Input() canEditAsManager = false;
  @Input() popoverTriggers: string = 'click';
  @Input() timeSlotTemplates: TimeSlotTemplateDTO[];
  @Input() timeslotStates: TimeSlotStateOfSeat[];
  @Input() currentDayStatus: Day[] = [];

  @Input() set user(val: User[] | User) {
    if (!val) {
      this._users = [null];
    } else {
      if (!Array.isArray(val)) {
        this._users = [val];
      } else {
        this._users = val;
      }
    }

    this._booked = this._users.filter(x => x != null).length > 0 ? true : false;
  }

  _users: User[];
  _booked = false;

  @HostBinding('class.highlight') @Input() highlight: boolean;

  @Output() bookClicked = new EventEmitter<SeatBookedEvent>();
  @Output() inviteClicked = new EventEmitter<SeatInvitedEvent>();
  @Output() chipClicked = new EventEmitter<User>();
  @Output() editClicked = new EventEmitter<Seat>();
  @Output() deleteClicked = new EventEmitter<Seat>();
  @Output() popoverShown = new EventEmitter<any>();
  @Output() popoverHidden = new EventEmitter<any>();

  private _destroyed = new Subject<void>();

  modeHalfDay = false;
  timeSlots: { id: string, label: string }[] = [];

  isRuleCollapsed = false;
  OccupationTypeEnum = OccupationType;
  canLeaveStates: boolean[];

  selectedDayStatusByTimeslot: { [key: string]: Day } = {};
  notDefinedStatusName = Location_Non_Defined_Name;

  constructor(
    private modalService: ModalService,
    private translocoService: TranslocoService,
    private staticDataService: StaticDataService,
  ) {

  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.timeslotStates && this.timeslotStates) {
      const users: User[] = [];
      this.canLeaveStates = [];
      this.timeSlotTemplates.forEach((t, index) => {
        if (this.timeslotStates.findIndex(y => y.timeslotIndex == index) >= 0) {
          users[index] = this._users[index] || this._users[0];
        } else {
          users.push(null);
        }
      })

      const forFullDay = this.timeslotStates[0].forAllDay;
      this._users = forFullDay ? users.filter(x => x != null) : users;
      // this.updateCanLeaveStates();

    }

    this.updateModeHalfDay();

  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  toggleCollapseRule($event: any) {
    $event.preventDefault();
    $event.stopPropagation();
    this.isRuleCollapsed = !this.isRuleCollapsed;
  }

  /**
   * Handler when halfday changed
   */
  onHalfDayChanged() {
    if (this.timeSlotTemplates) {
      this.timeSlots = this.staticDataService.factoryTimeslotOptions(this.timeSlotTemplates, this.modeHalfDay);
      if (this.modeHalfDay && this.timeslotStates && this.timeslotStates[0].forAllDay && this._users.length < 2) {
        this._users.push({ ...this._users[0] });
      }
      this.updateCanLeaveStates();
    }
  }


  onBookClicked(timeslot: TimeSlotTemplateDTO, doLeave: boolean, $event: Event) {
    this.bookClicked.emit({
      doLeave,
      seat: this.seat, timeslotId: timeslot.id,
      modeHalfDay: this.modeHalfDay
    });
    this.popoverRef.hide();
  }

  onInviteClicked(timeslotIndex: number) {
    this.inviteClicked.emit(<SeatInvitedEvent>{
      seat: this.seat,
      office: this.seat.office,
      timeslotIndex: timeslotIndex
    });
    this.popoverRef.hide();
  }

  onEditClicked() {
    this.editClicked.emit(this.seat);
    this.popoverRef.hide();
  }

  onDeleteClicked() {
    this.deleteClicked.emit(this.seat);
    this.popoverRef.hide();
  }

  onMouseleave() {
    this.popoverRef.hide();
  }

  onPopoverShown($event: any) {
    this.popoverShown.emit(this.seat.id);
  }

  closePopover() {
    if (this.popoverRef) {
      this.popoverRef.hide();
    }
  }

  openPopover() {
    this.popoverRef.show();
  }

  onHidden() {
    this.popoverHidden.emit();
  }

  onChipClicked(timeSlotIndex: number) {
    this.popoverRef.hide();
    this.chipClicked.emit(this._users[timeSlotIndex]);
  }

  onLeaveClicked(user: User, timeslot: TimeSlotTemplateDTO, doLeave: boolean) {
    this.checkShowModalConfirmation(timeslot).subscribe(ok => {
      if (ok) {
        this.bookClicked.emit({
          doLeave,
          userId: user.id,
          timeslotId: timeslot.id,
          seat: this.seat,
          modeHalfDay: false
        });
        this.popoverRef.hide();
      }
    })
  }

  private updateModeHalfDay() {

    this.selectedDayStatusByTimeslot = {};
    if (this.currentDayStatus) {
      this.currentDayStatus.forEach(dayStatus => {
        this.selectedDayStatusByTimeslot[dayStatus.selectedTimeslotId] = { ...dayStatus };
      });
    }

    const unifiedCurrentDayStatus = this.uniquify(this.currentDayStatus);

    this.modeHalfDay = this.halfDayEnabled && this.timeSlotTemplates.length >= LIMIT_HALFDAY &&
      (this._users.length >= LIMIT_HALFDAY || unifiedCurrentDayStatus.length >= LIMIT_HALFDAY);
    this.onHalfDayChanged();

  }

  /**
   * Update can leave states
   */
  private updateCanLeaveStates() {
    this.canLeaveStates = this._users.map(u => {
      if (u == null) return false;
      const found = this.timeslotStates.find(x => x.userId == u.id);
      if (found) {
        return found.seatId == this.seat.id || this.canEditAsManager;
      } else {
        return false;
      }
    })
  }

  private checkShowModalConfirmation(timeslot: TimeSlotTemplateDTO): Observable<boolean> {
    const timeSlotIndex = this.timeSlotTemplates.findIndex(x => x.id === timeslot.id);
    const _user = this._users[timeSlotIndex];
    const isCurrentUser = _user?.id === this.currentUser.id;
    const message = !isCurrentUser
      ? this.translocoService.translate('main.remove_user_name_from_the_desk', {
        username: _user.fullName
      }) : this.translocoService.translate('main.leave_from_the_desk_himself');

    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: '400px',
      disableClose: true,
      customClass: 'modal-confirmation',
      data: {
        message,
      }
    });

    return modalRef.afterClosed$;
  }

  /**
  * Check if same location for halfdays
  * @param items 
  */
  private uniquify(items: Day[]): Day[] {
    if (items.length <= 1) return items;
    return _.uniq(items, x => {
      return `${x.selectedRemoteLocationId}${x.selectedRemoteSeatId}`;
    })
  }

}
