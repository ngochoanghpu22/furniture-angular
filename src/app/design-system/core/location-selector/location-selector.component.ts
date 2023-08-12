import {
  Component, EventEmitter, Input, OnChanges,
  OnInit, Output, SimpleChanges, ViewChild
} from '@angular/core';
import {
  AuthenticationService,
  Day,
  HierarchyLevel, IMetadataItem, IMetadataValue, Location,
  LocationChangedEvent, LocationDetailDTO, SeatBookedEvent,
  SeatInvitedEvent, SelectionSeatResultTypes,
  StaticDataService, TimeSlotTemplateDTO
} from '@flex-team/core';
import { DateTime } from 'luxon';
import { Observable, of } from 'rxjs';
import { FxtAnimations } from '../animations';
import { DropdownComponent } from '../dropdown';
import { ModalSelectionSeatComponent } from '../location-panel';
import { ModalInviteSeatComponent, ModalService } from '../modal';
import { ModalMetadataValuesComponent } from '../modal-metadata';

@Component({
  selector: 'fxt-location-selector',
  templateUrl: './location-selector.component.html',
  styleUrls: ['./location-selector.component.scss'],
  animations: [
    FxtAnimations.rotate
  ]
})
export class LocationSelectorComponent implements OnInit, OnChanges {
  @Output() onToggle = new EventEmitter<boolean>();
  @ViewChild('dropdown') dropdown: DropdownComponent;

  public HierarchyLevelEnum = HierarchyLevel;

  @Input() selectedDays: Day[] = [];
  @Input() locations: Location[] = [];
  @Input() highlight = false;
  @Input() enableMap: boolean;
  @Input() userId: string;
  @Input() selectedDate: DateTime;
  @Input() rootAtWork: Location;

  @Output() locationClicked: EventEmitter<LocationChangedEvent> = new EventEmitter();
  @Output() seatInvited: EventEmitter<SeatInvitedEvent> = new EventEmitter();

  timeSlotTemplates: TimeSlotTemplateDTO[];
  selectedLocationIds: string[] = [];

  selectedLocationNames: string;

  constructor(
    private staticDataService: StaticDataService,
    private modalService: ModalService,
    private authService: AuthenticationService
  ) {
    this.timeSlotTemplates = this.authService.timeSlotTemplates;
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.locations && this.locations) {
      this.staticDataService.updatePaddingLeft(this.locations);
      this.staticDataService.updateConsolidatedActualLoad(this.locations);
    }

    if (changes.selectedDays && this.selectedDays) {
      this.selectedLocationIds = this.selectedDays.map(x => x?.selectedRemoteLocationId);
      const selectedLocationNames: string[] = [];
      const ids: string[] = [];
      this.selectedDays.filter(x => x != null)
        .forEach(x => {
          if (!ids.includes(x.selectedRemoteLocationId)) {
            selectedLocationNames.push(x.selectedRemoteLocationAddress);
            ids.push(x.selectedRemoteLocationId);
          }
        });

      this.selectedLocationNames = selectedLocationNames.join(' / ');
    }

  }

  toggleLocation() {
    this.onToggle.emit(true);
    this.dropdown.toggle();
  }

  onChangeLocation(location: Location, parent: Location, event: any) {
    const isBuildingOrFloor =
      location.hierarchyLevel != null &&
      location.hierarchyLevel != HierarchyLevel.Office;

    if (isBuildingOrFloor) {
      event?.preventDefault();
      event?.stopPropagation();
      return;
    }

    const doOpenModal = parent && parent.seatArchitectureId != null
      && parent.maxPerson > 0;

    if (this.enableMap && doOpenModal) {
      this.openModalSelectionSeat(location, parent);
    } else {
      this.closeAndEmitLocation(location, null);
    }

  }

  private openModalSelectionSeat(loc: Location, parent: Location) {
    const modalRef = this.modalService.open(ModalSelectionSeatComponent, {
      data: {
        floorId: parent?.id,
        buildingId: parent?.idParentLocation,
        officeId: loc.id,
        date: this.selectedDate,
        userId: this.userId,
        timeSlotTemplatesByDay: this.timeSlotTemplates.filter(x => x.dayOfWeek === this.selectedDate.weekday),
        timeslotIndex: 0
      },
      escToClose: true,
      disableClose: true,
      customClass: 'modal-selection-seat-container',
      width: '90%',
      height: '80%'
    });

    modalRef.afterClosed$.subscribe((resp: { type: SelectionSeatResultTypes, event: any }) => {
      if (resp) {
        switch (resp.type) {
          case SelectionSeatResultTypes.Book:
            this.closeAndEmitLocation(loc, resp.event);
            break;
          case SelectionSeatResultTypes.Invite:
            this.onInviteSeatClicked(resp.event);
            break;
          default:
            break;
        }
      }
    })
  }

  private closeAndEmitLocation(location: Location, $event: SeatBookedEvent) {
    const locationChangedEvt = <LocationChangedEvent>{
      userId: $event?.userId || this.userId,
      date: this.selectedDate,
      location: location,
      seat: $event?.seat,
      doLeave: $event?.doLeave,
      timeslotId: $event?.timeslotId,
      modeHalfDay: $event?.modeHalfDay
    };

    const events = [locationChangedEvt];
    const timeslotIndex = 0;

    this.tryOpenModalMetadataValuesComponent(events, timeslotIndex)
      .subscribe((resp: IMetadataValue[] | null | boolean) => {
        if (resp != null) {
          events[timeslotIndex].metadataValues = resp !== false ? (resp as any) : [];
          this.locationClicked.emit(events[timeslotIndex]);
          this.dropdown.toggle();
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

    return (!$event.doLeave && $event.location?.metadataTemplate?.metadataItems?.length > 0)
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

  /**
  * Invite seat handler
  * @param $event 
  */
  onInviteSeatClicked($event: SeatInvitedEvent) {
    $event.targetDate = this.selectedDate.toJSDate();
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
          const requestDto: LocationDetailDTO = this.staticDataService.getLocationDetailDTOFromOffice($event.office, $event.seat, null, false);

          const locationChangedEvt = <LocationChangedEvent>{
            userId: this.authService.currentUser.id,
            date: this.selectedDate,
            location: requestDto.targetLocation,
            seat: $event?.seat,
            doLeave: false,
            timeslotId: null,
            modeHalfDay: false
          };

          const events = [locationChangedEvt];
          const timeslotIndex = 0;
          action$ = this.tryOpenModalMetadataValuesComponent(events, timeslotIndex);
        }

        action$.subscribe((resp: IMetadataValue[] | null | boolean) => {
          if (resp != null) {
            $event.metadataValues = resp !== false ? (resp as any) : [];
            this.seatInvited.emit($event);
          }
        })

      }
    })
  }

}
