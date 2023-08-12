import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AuthenticationService,
  Day,
  ManagerOfficeService, ManagerSeatService,
  OccupationBuildingDTO,
  OccupationRuleItem,
  Office, PlanService, SeatArchitecture, SeatBookedEvent,
  SeatInvitedEvent, SelectionSeatResultTypes, TimeSlotStateOfSeat,
  TimeSlotTemplateDTO, User, UserSeat
} from '@flex-team/core';
import { DateTime } from 'luxon';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalConfig, ModalRef } from '../../modal';

/**
 * This component is used only for mobile view.
 */
@Component({
  selector: 'fxt-modal-selection-seat',
  templateUrl: './modal-selection-seat.component.html',
  styleUrls: ['./modal-selection-seat.component.scss']
})
export class ModalSelectionSeatComponent implements OnInit, OnDestroy {

  loading = true;
  seatArchitecture: SeatArchitecture;
  floorId: string;
  buildingId: string;
  userId: string;
  date: DateTime;
  mapSeatUsers: Map<string, User[]> = new Map();
  mapSeatTimeslots: Map<string, TimeSlotStateOfSeat[]> = new Map();

  timeSlotTemplatesByDay: TimeSlotTemplateDTO[];
  timeslotIndex: number;

  offices: Office[];
  userSeats: UserSeat[];
  unconfirmedUsers: User[] = [];
  currentUser: User;
  currentDayStatus: Day[];
  occupationState: OccupationBuildingDTO;
  disableBookState: { [key: string]: boolean } = {};
  mapOccupationRules: Map<string, OccupationRuleItem[]> = new Map();

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private config: ModalConfig,
    private modalRef: ModalRef,
    private authService: AuthenticationService,
    private managerSeatService: ManagerSeatService,
    private managerOfficeService: ManagerOfficeService,
    private planService: PlanService
  ) {
    this.buildingId = this.config.data.buildingId;
    this.floorId = this.config.data.floorId;
    this.date = this.config.data.date;
    this.userId = this.config.data.userId;
    this.timeSlotTemplatesByDay = this.config.data.timeSlotTemplatesByDay;
    this.timeslotIndex = this.config.data.timeslotIndex;

    this.authService.currentUser$.pipe(takeUntil(this._destroyed))
      .subscribe(data => {
        this.currentUser = data;
      })
  }

  ngOnInit() {
    this.getSeatArchitecture(this.floorId);
    this.getDayStatusOfCurrentUser(this.date);
    this.getOccupationsByBuilding(this.buildingId, this.date.toJSDate());
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  documentClick(event: Event): void {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  /**
   * Handler when button book is clicked
   * @remarks This method close the modal with `SeatBookedEvent` event
   * @param $event 
   */
  onBookClicked($event: SeatBookedEvent) {
    this.close({
      type: SelectionSeatResultTypes.Book,
      event: $event
    });
  }

  onInviteClicked($event: SeatInvitedEvent) {
    this.close({
      type: SelectionSeatResultTypes.Invite,
      event: $event
    });
  }

  /**
   * Get day status
   */
  private getDayStatusOfCurrentUser(date: DateTime) {
    this.planService.getDayStatus(date.year, date.month, date.day)
      .subscribe((resp: any) => {
        this.currentDayStatus = resp.workload;
      })
  }

  /**
   * Get occupation by building
   * @param buildingId 
   * @param date 
   */
  private getOccupationsByBuilding(buildingId: string, date: Date) {
    this.managerSeatService.getOccupationsByBuilding(buildingId, date).subscribe(resp => {
      this.occupationState = resp.workload;
      this.setOccupationStateForOffice();
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

  /**
   * `API` Get seat architecture for given floorId
   * @param floorId 
   */
  private getSeatArchitecture(floorId: string) {
    this.loading = true;
    this.managerSeatService.getSeatArchitecture(floorId)
      .pipe(finalize(() => this.loading = false))
      .subscribe(resp => {
        this.seatArchitecture = resp.workload;
        this.getSeatData(floorId, this.date);
        this.getOffices(floorId);
      })
  }

  private getSeatData(floorId: string, date: DateTime) {
    this.managerSeatService.getSeatData(floorId, date.toJSDate()).subscribe(resp => {
      this.userSeats = resp.workload;
      this.unconfirmedUsers = resp.workload.filter(x => !x.seatId).map(x => x.user);
      this.setSeatWithUser();
    })
  }

  private getOffices(floorId: string) {
    if (!this.floorId) return;
    this.managerOfficeService.getOfficesByFloor(floorId).subscribe((resp) => {
      this.offices = resp.workload;
    })
  }

  private setSeatWithUser() {
    if (!this.seatArchitecture) return;

    this.mapSeatUsers = new Map();
    this.seatArchitecture.seats.forEach((seat) => {

      const founds = this.userSeats.filter((x) => x.seatId == seat.id);
      const usersWhoBookedSeat = founds.map(x => x.user);
      const timeslotsIndexBySeat: TimeSlotStateOfSeat[] = [];

      founds.forEach(x => {
        const timeslotIndex = this.timeSlotTemplatesByDay
          .findIndex(t => x.startHour <= t.stopHour && x.stopHour >= t.startHour);

        const forAllDay = x.startHour <= this.timeSlotTemplatesByDay[0].stopHour
          && x.stopHour >= this.timeSlotTemplatesByDay[this.timeSlotTemplatesByDay.length - 1].startHour;

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

      } else {
        this.mapSeatUsers.set(seat.id, []);
      }
    });

  }

  private close(resp?: { type: SelectionSeatResultTypes, event: any }) {
    this.modalRef.close(resp);
  }


}
