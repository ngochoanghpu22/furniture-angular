import {
  ChangeDetectorRef, Component, EventEmitter, Input, OnChanges,
  OnDestroy, OnInit, Output, SimpleChanges
} from '@angular/core';
import {
  ModalInviteSeatComponent,
  ModalMetadataValuesComponent, ModalService
} from '@design-system/core';
import {
  AuthenticationService, BookingLocationRequest, Day, Floor, HierarchyLevel,
  IMetadataItem, IMetadataValue, LocationDetailDTO,
  Location_InOffice_Name,
  ManagerMapContext, ManagerMapViewService, ManagerOfficeService,
  ManagerSeatService, ManagerViewService, MeetingRoomDTO, MessageService,
  MetadataTemplate,
  OccupationBuildingDTO,
  Office, OfficeClickedEvent, PlanService, Seat, SeatBookedEvent,
  SeatInvitedEvent,
  SelectionItem, SelectionType, StaticDataService, TimeSlotTemplateDTO, User, UserSeat
} from '@flex-team/core';
import { DateTime } from 'luxon';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModalUserProfileComponent } from 'src/app/components';
import { ProcessingLocationService } from 'src/app/processing-location.service';
import { MeetingSchedulerComponent } from '../meeting-scheduler/meeting-scheduler.component';

@Component({
  selector: 'fxt-manager-map-detail-content',
  templateUrl: './detail-content.component.html',
  styleUrls: ['./detail-content.component.scss']
})
export class DetailContentComponent implements OnInit, OnChanges, OnDestroy {

  @Input() buildingId: string;
  @Input() selectedDate: Date;
  @Input() modeModal = false;
  @Input() targetUserId: string;

  @Output() bookSucceeded = new EventEmitter<any>();

  selectedFloor: Partial<Floor>;

  overflowUsers: User[] = [];
  userSeats: UserSeat[] = [];
  highlightUserIds: string[] = [];
  objHighlightUserIds: any = {};

  private _destroyed: Subject<void> = new Subject<void>();
  disablePrev = false;
  disableNext = false;

  limitDate: DateTime
  limitValue: Number = 2;

  tags: SelectionItem[];
  occupationState: OccupationBuildingDTO;

  public currentUser: User;
  isDeskBookingEnabledOnFloor: boolean;
  isFloatingReservationsEnabled: boolean;
  isHalfDaysEnabled: boolean;

  offices: Office[];
  meetingRooms: MeetingRoomDTO[];
  meetingRoomsHavingCoordinates: MeetingRoomDTO[];
  metadataTemplate: MetadataTemplate;
  timeslotTemplates: TimeSlotTemplateDTO[];

  currentDayStatus: Day[];

  isFirstChangeOfSelectionFired = false;
  lastSelection: SelectionItem[] = [];

  constructor(
    private managerMapViewService: ManagerMapViewService,
    private managerViewService: ManagerViewService,
    private managerSeatService: ManagerSeatService,
    private planService: PlanService,
    private messageService: MessageService,
    private modalService: ModalService,
    private authService: AuthenticationService,
    private managerOfficeService: ManagerOfficeService,
    private processingLocationService: ProcessingLocationService,
    private cd: ChangeDetectorRef,
    private staticDataService: StaticDataService
  ) {
    this.isFloatingReservationsEnabled = this.authService.isFloatingReservationsEnabled;
    this.isHalfDaysEnabled = this.authService.IsHalfDaysEnabled;
    this.timeslotTemplates = this.authService.timeSlotTemplates;

    this.managerMapViewService.context$.pipe(takeUntil(this._destroyed))
      .subscribe((context: ManagerMapContext) => {

        const isFloorChanged = this.selectedFloor != context.selectedFloor;
        this.selectedFloor = context.selectedFloor;

        if (context.floors.length > 0) {
          this.disablePrev = context.floors[0].id === context.selectedFloor?.id;
          this.disableNext = context.floors[context.floors.length - 1].id === context.selectedFloor?.id;
        }

        this.metadataTemplate = context.metadataTemplate;

        if (this.selectedFloor) {
          if (isFloorChanged && this.selectedDate) {
            this.getFloorInfos(this.selectedFloor.id, this.selectedDate);
          }
        } else {
          this.setNoFloorState();
        }
      });

  }

  ngOnInit() {

    this.targetUserId = this.targetUserId || this.authService.currentUser.id;

    this.managerMapViewService.selection$.pipe(takeUntil(this._destroyed))
      .subscribe(selection => {
        this.tags = selection;
      });

    this.authService.currentUser$.pipe(takeUntil(this._destroyed))
      .subscribe(data => {
        this.currentUser = data;
        this.cd.detectChanges();
      });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.buildingId && this.buildingId && this.selectedDate) {
      this.getOccupationsByBuilding(this.buildingId, this.selectedDate);
    }

    if (changes.selectedDate && this.selectedDate) {
      this.getDayStatusOfCurrentUser(this.selectedDate);
      if (this.selectedFloor) {
        this.getFloorInfos(this.selectedFloor.id, this.selectedDate);
      }
      if (this.buildingId) {
        this.getOccupationsByBuilding(this.buildingId, this.selectedDate);
      }
    }
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  private getOccupationsByBuilding(buildingId: string, date: Date) {
    this.managerSeatService.getOccupationsByBuilding(buildingId, date).subscribe(resp => {
      this.occupationState = resp.workload;
    })
  }

  onSelectionChanged(selection: SelectionItem[]) {
    this.managerViewService.selection = selection;
    this.getHighlightUserIds(selection);

    if (this.isFirstChangeOfSelectionFired && selection.length > 0 && this.lastSelection.length < selection.length) {
      const lastItem = selection[selection.length - 1];
      if (lastItem.type === SelectionType.User) {
        this.managerMapViewService.clickedUserId = lastItem.id;
      }
    }

    if (!this.isFirstChangeOfSelectionFired) {
      this.isFirstChangeOfSelectionFired = true;
    }

    this.lastSelection = [...selection];
  }

  prevFloor() {
    this.managerMapViewService.prevFloor();
  }

  nextFloor() {
    this.managerMapViewService.nextFloor();
  }

  refreshSeatInformation() {
    this.getSeatData(this.selectedFloor.id, this.selectedDate);
    this.getDayStatusOfCurrentUser(this.selectedDate);
    this.managerMapViewService.forceLoad();
    this.messageService.success();
  }

  getHighlightUserIds(selection: SelectionItem[]) {
    const objHighlightUserIds: any = {};
    this.managerSeatService.getHighlightUsers(selection).subscribe(resp => {
      this.highlightUserIds = resp.workload;
      this.managerMapViewService.highlightUserIds = resp.workload;
      this.highlightUserIds.forEach(x => objHighlightUserIds[x] = true);
      this.objHighlightUserIds = objHighlightUserIds;
    })
  }

  openUserProfilePopup(user: User) {
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
   * Seat booked handler
   * @param $event 
   */
  onBookSeatClicked($event: SeatBookedEvent) {
    const targetUserId = $event.doLeave ? $event.userId : this.targetUserId;
    const locationDetailDto = this.staticDataService.getLocationDetailDTOFromOffice($event.seat.office, $event.seat, $event.timeslotId, $event.doLeave);
    const req = <BookingLocationRequest>{
      userId: targetUserId,
      date: this.selectedDate,
      modeHalfDay: $event.modeHalfDay,
      locations: [locationDetailDto]
    }
    this.tryOpenModalMetadataAndSaveLocationOrBookSeat(req);
  }

  /**
   * Invite seat handler
   * @param $event 
   */
  onInviteSeatClicked($event: SeatInvitedEvent) {
    $event.targetDate = this.selectedDate;
    const modalRef = this.modalService.open(ModalInviteSeatComponent, {
      width: '500px',
      data: $event
    });

    modalRef.afterClosed$.subscribe(resp => {
      if (resp != null) {
        $event.email = resp.email;
        const isExternal = !resp.id;

        let action$ = of([]);

        if (!isExternal) {
          const requestDto = this.staticDataService.getLocationDetailDTOFromOffice($event.office, $event.seat, null, false);
          action$ = this.tryOpenModalMetadataValuesComponent(requestDto)
        }

        action$.subscribe((resp: IMetadataValue[] | null | boolean) => {
          if (resp != null) {
            $event.metadataValues = resp !== false ? (resp as any) : [];
            this.inviteSeat($event);
          }
        })

      }
    })
  }

  /**
   * Get day status
   */
  private getDayStatusOfCurrentUser(date: Date) {
    this.planService.getDayStatus(date.getFullYear(), date.getMonth() + 1, date.getDate())
      .subscribe((resp: any) => {
        this.currentDayStatus = resp.workload;
      })
  }

  /**
   * Call API: invite seat
   * @param $event 
   */
  private inviteSeat($event: SeatInvitedEvent) {
    this.planService.inviteSeat($event).subscribe(resp => {
      if (!resp.errorCode) {
        if (resp.workload != null) {
          this.refreshSeatInformation();
          this.messageService.success();
        }
      } else {
        this.messageService.error(`message_error.${resp.errorCode}`);
      }
    })
  }


  /**
   * Office selected hanlder
   * @param office 
   */
  onOfficeSelected($event: OfficeClickedEvent) {
    const timeslot = this.timeslotTemplates.find(x => x.id === $event.timeslotId);
    const locationDetailDto = this.staticDataService.getLocationDetailDTOFromOffice($event.office, null, timeslot?.id, $event.doLeave);

    const req: BookingLocationRequest = {
      userId: this.targetUserId,
      date: this.selectedDate,
      modeHalfDay: $event.modeHalfDay,
      locations: [locationDetailDto]
    }

    this.tryOpenModalMetadataAndSaveLocationOrBookSeat(req);
  }

  onInviteOfficeClicked(office: Office) {
    const $event: SeatInvitedEvent = {
      email: null,
      office: office,
      seat: null,
      timeslotIndex: null,
      targetDate: this.selectedDate,
      metadataValues: []
    }
    this.onInviteSeatClicked($event);
  }

  /**
  * If location has metadatatemplate, show the modal to fill the metadata values
  * @param $event 
  * @returns 
  */
  private tryOpenModalMetadataValuesComponent($event: LocationDetailDTO)
    : Observable<IMetadataValue[] | null> {

    return (!$event.doLeave && this.metadataTemplate?.metadataItems?.length > 0)
      ? this.openModalAddOrEditMetadataValues($event, {
        valueModel: [],
        itemsModel: this.metadataTemplate.metadataItems,
        bookingId: null,
        location: $event.targetLocation
      }) : of(false);
  }

  /**
   * Show modal add or edit metadata values
   * @param $event 
   * @param data 
   * @returns 
   */
  private openModalAddOrEditMetadataValues($event: LocationDetailDTO, data: any)
    : Observable<any> {

    const itemsModel: Array<IMetadataItem> = data.itemsModel;

    data.hasMandatoryMetadata = itemsModel.filter(i => i.isMandatory).length > 0;
    data.toCreate = true;
    data.location = $event.targetLocation;

    const modalRef = this.modalService.open(ModalMetadataValuesComponent, {
      width: '500px',
      maxHeight: '500px',
      customClass: 'modal-selection-seat-container',
      data: data,
      hideBtnClose: data.hasMandatoryMetadata
    });

    return modalRef.afterClosed$;
  }

  /**
   * Try save location or book seat
   * @param req 
   */
  private trySaveLocationOrBookSeat(req: BookingLocationRequest) {
    this.processingLocationService.trySaveLocationOrBookSeat(req, { name: '' })
      .subscribe(resp => {
        if (!resp.errorCode) {
          if (resp.workload != null) {
            this.refreshSeatInformation();
            this.bookSucceeded.emit(resp);
          }
        } else {
          this.messageService.error(`message_error.${resp.errorCode}`);
        }
      })
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

  /**
   * Try open modal metadata and save location or book seat
   * @param req 
   */
  private tryOpenModalMetadataAndSaveLocationOrBookSeat(req: BookingLocationRequest) {
    this.tryOpenModalMetadataValuesComponent(req.locations[0])
      .subscribe((resp: IMetadataValue[] | null | boolean) => {
        if (resp != null) {
          req.locations[0].metadataValues = resp !== false ? (resp as any) : [];
          this.trySaveLocationOrBookSeat(req);
        }
      })
  }

  private getSeatData(floorId: string, date: Date) {
    this.managerSeatService.getSeatData(floorId, date).subscribe(resp => {
      this.userSeats = resp.workload;
    })
  }

  /**
   * Call API: get floor infos
   * @param floorId 
   * @param date 
   */
  private getFloorInfos(floorId: string, date: Date) {
    this.managerOfficeService.getFloorInfos(floorId, date).subscribe(resp => {
      this.offices = resp.workload.offices;
      this.meetingRooms = resp.workload.meetingRooms;
      this.meetingRoomsHavingCoordinates = resp.workload.meetingRooms.filter(x => x.coordinate != null);

      this.userSeats = resp.workload.userSeats;
      this.isDeskBookingEnabledOnFloor = resp.workload.isDeskBookingEnabled;
      this.cd.detectChanges();
    })
  }

  /**
   * Set no floor state
   */
  private setNoFloorState() {
    this.offices = [];
    this.meetingRooms = [];
    this.meetingRoomsHavingCoordinates = this.meetingRooms.filter(x => x.coordinate != null);
    this.userSeats = [];
    this.isDeskBookingEnabledOnFloor = false;
  }

}
