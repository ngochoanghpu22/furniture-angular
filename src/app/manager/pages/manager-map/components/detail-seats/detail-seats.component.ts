import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {
  MapSeatComponent,
  ModalService
} from '@design-system/core';
import {
  AuthenticationService, Day, ManagerMapViewService, ManagerSeatService,
  MeetingRoomDTO, OccupationBuildingDTO, OccupationRuleItem, SeatArchitecture,
  SeatBookedEvent, SeatInvitedEvent, TimeSlotStateOfSeat, TimeSlotTemplateDTO,
  User,
  UserSeat
} from '@flex-team/core';
import { DateTime } from 'luxon';
import { Subject } from 'rxjs';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { ModalUserProfileComponent } from 'src/app/components';
import { MeetingSchedulerComponent } from '../meeting-scheduler/meeting-scheduler.component';

@Component({
  selector: 'fxt-detail-seats',
  templateUrl: './detail-seats.component.html',
  styleUrls: ['./detail-seats.component.scss'],
})
export class DetailSeatsComponent implements OnInit, OnChanges {
  @ViewChild(MapSeatComponent, { static: false }) mapSeatRef: MapSeatComponent;

  @Input() floorId: string;
  @Input() selectedDate: Date;
  @Input() userSeats: UserSeat[] = [];
  @Input() meetingRooms: MeetingRoomDTO[] = [];
  @Input() highlightUserIds: string[] = [];
  @Input() occupationState: OccupationBuildingDTO;
  @Input() currentDayStatus: Day[];

  @Output() bookClicked = new EventEmitter<SeatBookedEvent>();
  @Output() inviteClicked = new EventEmitter<SeatInvitedEvent>();

  seatArchitecture: SeatArchitecture;

  mapSeatUsers: Map<string, User[]> = new Map();
  mapSeatTimeslots: Map<string, TimeSlotStateOfSeat[]> = new Map();

  objHighlightSeatUser: { [key: string]: boolean } = {};
  disableBookState: { [key: string]: boolean } = {};
  mapOccupationRules: Map<string, OccupationRuleItem[]> = new Map();

  highlightSeatIds: string[] = [];
  loading = true;

  timeSlotTemplates: TimeSlotTemplateDTO[];

  private _destroyed: Subject<void> = new Subject<void>();
  clickedUserId: string;
  currentUser: User;

  constructor(
    private managerSeatService: ManagerSeatService,
    private modalService: ModalService,
    private managerMapViewService: ManagerMapViewService,
    private authService: AuthenticationService
  ) {
    this.authService.currentUser$.pipe(takeUntil(this._destroyed))
      .subscribe(data => {
        this.currentUser = data;
      });

  }

  ngOnInit() {

    this.managerMapViewService.clickedUserId$.pipe(
      takeUntil(this._destroyed),
      filter((x) => x != null)
    ).subscribe((data) => {
      if (data) {
        this.clickedUserId = data;
        this.openPopoverSeat(data);
      }
    });

    this.managerMapViewService.highlightSeatIds$.pipe(
      takeUntil(this._destroyed),
      filter((x) => x != null)
    ).subscribe((data: string[]) => {
      this.highlightSeatIds = data;
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.highlightSeatIds = [];

    if (changes.selectedDate && changes.selectedDate.currentValue) {
      const date = DateTime.fromJSDate(this.selectedDate);
      this.timeSlotTemplates = this.authService.timeSlotTemplates
        .filter(x => x.dayOfWeek === date.weekday);
    }

    if (changes.floorId && changes.floorId.currentValue) {
      this.getSeatArchitecture(this.floorId);
    }

    if (changes.userSeats && changes.userSeats.currentValue) {
      this.setSeatWithUser();
    }

    if (changes.highlightUserIds && changes.highlightUserIds.currentValue) {
      this.setSeatWithUser();
    }

    if (this.occupationState && this.floorId) {
      this.setOccupationStateForOffice();
    }
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  onChipClicked(user: User) {
    this.modalService.open(ModalUserProfileComponent, {
      width: '550px',
      maxHeight: '85%',
      customClass: 'modal-user-profile',
      data: {
        user: user
      },
    });
  }

  onMeetingRoomClicked(meetingRoom: MeetingRoomDTO) {
    this.modalService.open(MeetingSchedulerComponent, {
      width: '600px',
      disableClose: true,
      data: {
        meetingRoom: meetingRoom,
        selectedDate: this.selectedDate
      }
    })
  }

  private setOccupationStateForOffice() {
    this.disableBookState = {};
    this.mapOccupationRules.clear();
    const found = this.occupationState.floors.find(x => x.id === this.floorId);

    if (found != null) {
      found.offices.forEach(occupationOffice => {

        const occupationRules = occupationOffice.block.users
          .concat(occupationOffice.block.teams)
          .concat(occupationOffice.reserve.users)
          .concat(occupationOffice.reserve.teams);

        this.mapOccupationRules.set(occupationOffice.id, occupationRules);

        const isUserBlocked = occupationOffice.block.allUserIds.length > 0 && occupationOffice.block.allUserIds.includes(this.currentUser.id);
        const reservedForOthers = occupationOffice.reserve.allUserIds.length > 0 && !occupationOffice.reserve.allUserIds.includes(this.currentUser.id);
        this.disableBookState[occupationOffice.id] = (isUserBlocked || reservedForOthers) ? true : false;
      });
    }

  }

  private getSeatArchitecture(floorId: string) {
    this.loading = true;
    this.managerSeatService.getSeatArchitecture(floorId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: resp => {
          this.seatArchitecture = resp.workload;
          this.setSeatWithUser();
        }
      });
  }

  private setSeatWithUser() {
    if (!this.seatArchitecture) return;

    this.mapSeatUsers = new Map();
    this.objHighlightSeatUser = {};
    this.seatArchitecture.seats.forEach((seat) => {

      const founds = this.userSeats.filter((x) => x.seatId == seat.id);
      const usersWhoBookedSeat = founds.map(x => x.user);
      const timeslotsIndexBySeat: TimeSlotStateOfSeat[] = [];

      founds.forEach(x => {
        const timeslotIndex = this.timeSlotTemplates
          .findIndex(t => x.startHour <= t.stopHour && x.stopHour >= t.startHour);

        const forAllDay = x.startHour <= this.timeSlotTemplates[0].stopHour
          && x.stopHour >= this.timeSlotTemplates[this.timeSlotTemplates.length - 1].startHour;

        if (timeslotIndex >= 0) {
          timeslotsIndexBySeat.push(<TimeSlotStateOfSeat>{
            timeslotIndex: timeslotIndex,
            userId: x.user.id,
            seatId: x.seatId,
            forAllDay
          });
        }
      });

      if (founds.length > 0) {

        if (this.mapSeatUsers.get(seat.id) == null) {
          this.mapSeatUsers.set(seat.id, []);
          this.mapSeatTimeslots.set(seat.id, []);
        }

        this.mapSeatUsers.get(seat.id).push(...usersWhoBookedSeat);
        this.mapSeatTimeslots.get(seat.id).push(...timeslotsIndexBySeat);

        this.objHighlightSeatUser[seat.id] =
          this.highlightUserIds.findIndex(uId => usersWhoBookedSeat.findIndex(u => u.id == uId) >= 0) >= 0;
      } else {
        this.mapSeatUsers.set(seat.id, []);
        this.objHighlightSeatUser[seat.id] = false;
      }
    });

  }

  openPopoverSeat(userId: string) {
    const found = this.userSeats.find((x) => x.user.id == userId);
    if (this.mapSeatRef) {
      const popoverOpened = this.mapSeatRef.openPopoverSeat(found?.seatId);
      this.managerMapViewService.clickedUserId = null;
      if (popoverOpened) {
        this.clickedUserId = null;
      }
    }
  }

  /**
   * Handler map seats loaded
   */
  onMapLoaded() {
    setTimeout(() => {
      if (this.clickedUserId && this.userSeats.length > 0) {
        this.openPopoverSeat(this.clickedUserId);
      }
      this.clickedUserId = null;
    })

  }
}
