import {
  Component, EventEmitter, Input, OnChanges, OnInit, Output,
  SimpleChanges, ViewChild, ViewEncapsulation
} from '@angular/core';
import {
  Day, HierarchyLevel, IMetadataItem, IMetadataValue, Location,
  LocationChangedEvent, LocationChangedEventWithTrigger,
  LocationChangedTrigger, LocationInfoEvent, ManagerUserData, Seat,
  SeatBookedEvent, SeatInfoEvent, StaticDataService, TimeSlotTemplateDTO
} from '@flex-team/core';
import { DateTime } from 'luxon';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { AvailbleBSPositions } from 'ngx-bootstrap/positioning';
import { Observable, of } from 'rxjs';
import { ModalService } from '../modal';
import { ModalMetadataValuesComponent } from '../modal-metadata';
import { ModalSelectionSeatComponent } from './modal-selection-seat/modal-selection-seat.component';

@Component({
  selector: 'fxt-location-panel',
  templateUrl: './location-panel.component.html',
  styleUrls: ['./location-panel.component.scss'],
  host: {
    class: 'fxt-location-panel'
  },
  encapsulation: ViewEncapsulation.None
})
export class LocationPanelComponent implements OnInit, OnChanges {

  @ViewChild('popOffices') popoverOfficesRef: PopoverDirective;

  public HierarchyLevelEnum = HierarchyLevel;
  LocationChangedTriggerEnum = LocationChangedTrigger;

  @Input() locations: Location[] = [];
  @Input() date: DateTime;
  @Input() user: ManagerUserData;
  @Input() isConfirmed = false;
  @Input() canEdit: boolean;
  @Input() enableMap: boolean;
  @Input() disableMetadata: boolean;
  @Input() disableConfirm = false;
  @Input() halfDayEnabled = false;
  @Input() placementPanelOffices: AvailbleBSPositions = 'bottom';
  @Input() trigger: LocationChangedTrigger;
  @Input() timeSlotTemplates: TimeSlotTemplateDTO[];

  @Output() outsideClicked: EventEmitter<Location> = new EventEmitter();
  @Output() locationChanged: EventEmitter<LocationChangedEvent[]> = new EventEmitter<LocationChangedEvent[]>();
  @Output() seatClicked: EventEmitter<SeatInfoEvent> = new EventEmitter<SeatInfoEvent>();
  @Output() locationOfficeClicked: EventEmitter<LocationChangedEvent> = new EventEmitter<LocationChangedEvent>();
  @Output() mapSeatShown: EventEmitter<any> = new EventEmitter<any>();
  @Output() locationInfoClicked: EventEmitter<LocationInfoEvent> = new EventEmitter<LocationInfoEvent>();

  public selectedLocations: Location[] = [];
  public selectedSeats: Seat[] = [];
  public availableLocations: Location[][] = [[]];
  public buildings: Location[] = [];

  modeHalfDay = false;
  timeslots: { id: string, label: string }[] = [];
  timeSlotTemplatesByDay: TimeSlotTemplateDTO[];

  private rootAtWork: Location;

  get dayIndex(): number {
    return this.date.weekday - 1;
  }

  constructor(private modalServive: ModalService,
    private staticDataService: StaticDataService,
    private modalService: ModalService
  ) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    const locationsOfDay: Day[] = this.user.days[this.dayIndex];

    this.selectedLocations = [];
    this.selectedSeats = [];
    locationsOfDay.forEach((loc, index) => {

      const selectedLocation = this.staticDataService.findLocationById(this.locations, loc.selectedRemoteLocationId);
      this.selectedLocations.push(selectedLocation);

      let selectedSeat: Seat = null;
      if (loc.selectedRemoteSeatId && loc.inOffice) {
        selectedSeat = <Seat>{
          id: loc.selectedRemoteSeatId,
          index: loc.selectedRemoteSeatIndex,
          name: loc.selectedRemoteSeatName
        }
      }

      this.selectedSeats.push(selectedSeat);

      this.availableLocations[index] = this.locations
        .filter((x: Location) => x.inOffice || (x.id !== this.selectedLocations[index]?.id));

    });

    this.timeSlotTemplatesByDay = this.timeSlotTemplates.filter(x => x.dayOfWeek === this.date.weekday);
    this.initModeHalfday();

    this.rootAtWork = this.locations.find(x => x.inOffice && x.idParentLocation == null);
    this.setupBuildings();

  }

  /**
   * Handler location changed
   * @param loc 
   * @param timeslotIndex 
   */
  onLocationClicked(loc: Location, timeslotIndex: number) {

    this.selectedLocations[timeslotIndex] = loc;

    if (!loc.inOffice) {
      this.notifyLocationChanged(this.selectedLocations, null, timeslotIndex);
    } else {
      this.locationOfficeClicked.emit({
        date: this.date,
        userId: this.user.id,
        location: loc,
        metadataValues: [],
        seat: null,
        doLeave: false,
        timeslotId: this.timeSlotTemplates[timeslotIndex].id,
        modeHalfDay: this.modeHalfDay
      })
    }

    this.outsideClicked.emit();

  }

  /**
   * Confirm location
   * @param $event 
   */
  private confirmLocation($event: LocationInfoEvent) {
    if (!this.isConfirmed && this.canEdit) {
      const info = $event.locations[$event.timeslotIndex];
      this.selectedLocations[$event.timeslotIndex] = info.location;
      this.notifyLocationChanged(this.selectedLocations, null, $event.timeslotIndex);
    }
  }

  /**
   * Handler for toggle halfday
   * @param event 
   */
  onHalfDayChanged(event: any) {
    this.timeslots = this.staticDataService.factoryTimeslotOptions(this.timeSlotTemplatesByDay, this.modeHalfDay);
  }

  /**
   * Handler seat clicked
   * @param timeslotIndex 
   */
  onSeatClicked(timeslotIndex: number) {
    if (this.canEdit) {
      this.locationOfficeClicked.emit({
        date: this.date,
        userId: this.user.id,
        location: this.selectedLocations[timeslotIndex],
        metadataValues: [],
        seat: this.selectedSeats[timeslotIndex],
        doLeave: false,
        timeslotId: this.timeSlotTemplates[timeslotIndex].id,
        modeHalfDay: null
      })
    }
  }

  selectOffice(location: Location, parent: Location, timeslotIndex: number, event?: Event) {

    const isBuildingOrFloor =
      location.hierarchyLevel != null &&
      location.hierarchyLevel != HierarchyLevel.Office;

    if (isBuildingOrFloor) {
      event?.preventDefault();
      event?.stopPropagation();
      return;
    }

    const doOpenModal = parent && parent.seatArchitectureId != null
      && (location.maxSeatNumber != null && location.maxSeatNumber > 0);

    if (this.enableMap && doOpenModal) {
      event?.preventDefault();
      event?.stopPropagation();
      this.openModalSelectionSeat(location, parent, timeslotIndex);
    } else {
      this.selectedLocations[timeslotIndex] = location;
      this.notifyLocationChanged(this.selectedLocations, null, timeslotIndex);
    }

  }

  private openModalSelectionSeat(loc: Location, parent: Location, timeslotIndex: number) {
    this.mapSeatShown.emit();
    const modalRef = this.modalServive.open(ModalSelectionSeatComponent, {
      data: {
        floorId: parent?.id,
        officeId: loc.id,
        date: this.date,
        userId: this.user.id,
        timeSlotTemplates: this.timeSlotTemplates,
        timeslotIndex
      },
      disableClose: false,
      customClass: 'modal-selection-seat-container',
      width: '80%'
    });

    modalRef.afterClosed$.subscribe((seatInfo: SeatBookedEvent) => {
      if (seatInfo) {
        let selectedLocation = parent.children.find(x => x.id == seatInfo.seat.officeId);
        this.selectedLocations[timeslotIndex] = selectedLocation;

        this.notifyLocationChanged(this.selectedLocations, seatInfo, timeslotIndex);
      }
    })
  }

  /**
 * Handler confirme clicked
 * @param $event
 */
  confirmOrOpenModalMetadata(timeslotIndex: number) {

    if (!this.canEdit) return;

    const events: LocationChangedEvent[] = this.selectedLocations.map(x => {

      if (x == null) return null;
      if (x.inOffice) {
        x.metadataTemplate = this.rootAtWork.metadataTemplate;
      }

      return <LocationChangedEvent>{
        userId: this.user.id,
        location: x,
        date: this.date,
      }
    });

    if (!this.isConfirmed) {
      this.confirmLocation({
        locations: events,
        timeslotIndex: timeslotIndex
      });
    } else {
      this.locationInfoClicked.emit({
        locations: events,
        timeslotIndex: timeslotIndex
      });
    }
  }

  private notifyLocationChanged(locations: Location[], seatInfo: SeatBookedEvent, timeslotIndex: number) {

    let targetUserId = this.user.id;

    // If leave seat, make sure that the selected user is taken in account
    if (seatInfo && seatInfo.doLeave) {
      targetUserId = seatInfo.userId;
    }

    const events: LocationChangedEvent[] = locations.map((x, index) => {
      let seat = seatInfo?.seat;
      if (seat == null) {
        seat = x?.inOffice ? this.selectedSeats[index] : null;
      }
      return x != null ? <LocationChangedEvent>{
        userId: targetUserId,
        timeslotId: this.timeSlotTemplatesByDay[index].id,
        location: x,
        seat: seat,
        date: this.date,
        doLeave: seatInfo?.doLeave
      } : null;
    });

    this.tryOpenModalMetadataValuesComponent(events, timeslotIndex)
      .subscribe((resp: IMetadataValue[] | null | boolean) => {
        if (resp != null) {
          events[timeslotIndex].metadataValues = resp !== false ? (resp as any) : [];
          let modeHalfDay = this.modeHalfDay;
          const undefinedLocationIndex = events.findIndex(x => x == null);

          if (undefinedLocationIndex >= 0) {
            // Force fullday
            modeHalfDay = false;
            const definedLocationIndex = events.findIndex(x => x != null);
            if (definedLocationIndex >= 0) {
              events[undefinedLocationIndex] = { ...events[definedLocationIndex] };
            } else {
              return;
            }
          }

          this.staticDataService.notifyLocationChanged(<LocationChangedEventWithTrigger>{
            modeHalfDay: modeHalfDay,
            events: events,
            trigger: this.trigger
          });
          this.locationChanged.emit(events);

        }
      })
  }

  /**
   * Try open modal metadatavalues
   */
  private tryOpenModalMetadataValuesComponent($events: LocationChangedEvent[], timeslotIndex: number)
    : Observable<IMetadataValue[] | null> {
    const $event = $events[timeslotIndex];

    if ($event.location.inOffice) {
      $event.location.metadataTemplate = this.rootAtWork.metadataTemplate;
    }

    return (!$event.doLeave && $event.location?.metadataTemplate?.metadataItems?.length > 0
      && !this.disableMetadata)
      ? this.openModalAddOrEditMetadataValues($event, {
        valueModel: [],
        itemsModel: $event.location.metadataTemplate.metadataItems,
        bookingId: null,
        location: $event.location
      }) : of(false);
  }

  private openModalAddOrEditMetadataValues($event: LocationChangedEvent, data: any)
    : Observable<any> {

    const itemsModel: Array<IMetadataItem> = data.itemsModel;

    data.hasMandatoryMetadata = itemsModel.filter(i => i.isMandatory).length > 0;
    data.toCreate = true;

    const modalRef = this.modalService.open(ModalMetadataValuesComponent, {
      width: '500px',
      maxHeight: '500px',
      customClass: 'modal-selection-seat-container',
      data: data,
      hideBtnClose: data.hasMandatoryMetadata
    });

    return modalRef.afterClosed$;
  }

  private setupBuildings() {
    this.buildings = this.locations.filter(x => x.archived === false)
      .find(x => !x.hierarchyLevel && x.inOffice)?.children || [];
  }

  /**
   * Init mode halfday
   */
  private initModeHalfday() {
    let hasSameBooking = true;
    if (this.selectedLocations.length > 1) {
      const hasSameLocation = (this.selectedLocations[0]?.id == this.selectedLocations[1]?.id);
      const hasSameSeat = (this.selectedSeats[0]?.id == this.selectedSeats[1]?.id);
      hasSameBooking = hasSameLocation && hasSameSeat;
    }

    this.modeHalfDay = this.halfDayEnabled && !hasSameBooking;
    this.onHalfDayChanged(this.modeHalfDay);
  }

}


