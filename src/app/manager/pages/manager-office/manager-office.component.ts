import {
  ChangeDetectorRef,
  Component, OnDestroy,
  OnInit,
  Type
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ModalConfig, ModalConfirmationComponent, ModalService } from '@design-system/core';
import {
  addOrUpdateList, Building, Floor,
  ManagerOfficeService, ManagerSeatService, MeetingRoomCoordinate,
  MeetingRoomDTO, MessageService,
  Office, OfficeType, Seat, SeatArchitecture
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { of, Subject } from 'rxjs';
import { distinctUntilChanged, skip, takeUntil } from 'rxjs/operators';
import { SortableEvent } from 'sortablejs';
import { ArchiveConfirmationModalComponent } from '../../components';
import {
  ArchivedListComponent,
  ManagerOfficeModalAddBuildingComponent,
  ManagerOfficeModalAddFloorComponent,
  ManagerOfficeModalAddZoneComponent,
  ManagerOfficeModalDetailOfficeComponent,
  ModalAddSeatComponent, ModalDetailsBuildingComponent
} from './components';
import { ManagerOfficeViewService } from './services';

@Component({
  selector: 'app-manager-office',
  templateUrl: './manager-office.component.html',
  styleUrls: ['./manager-office.component.scss']
})
export class ManagerOfficeComponent implements OnInit, OnDestroy {
  OfficeTypeEnum = OfficeType;

  offices: Office[] = [];
  meetingRooms: MeetingRoomDTO[] = [];

  buildings: Building[] = [];
  floors: Floor[] = [];

  selectedBuilding: Building;
  selectedFloor: Floor;

  loadingOffices = false;
  loadingFloors = false;

  contextualPicture: SafeUrl | null;

  configModal: ModalConfig = {
    width: 'auto',
    height: 'auto',
    disableClose: true,
  };

  seatArchitecture: SeatArchitecture;
  highlightSeatIds: string[];

  onEndSortFn: (event: SortableEvent) => void;

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private managerOfficeService: ManagerOfficeService,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    private managerOfficeViewService: ManagerOfficeViewService,
    private domSanitizer: DomSanitizer,
    private messageService: MessageService,
    private managerSeatService: ManagerSeatService,
    private translocoService: TranslocoService
  ) {
    this.onEndSortFn = this.onEndSort.bind(this);
  }

  ngOnInit() {
    this.getBuildings();

    this.managerOfficeViewService.building$
      .pipe(takeUntil(this._destroyed), skip(1), distinctUntilChanged())
      .subscribe((building) => {
        this.selectedBuilding = building;
        if (building != null) {
          this.getFloorsByBuilding(this.selectedBuilding);
        }
      });

    this.managerOfficeViewService.floor$
      .pipe(takeUntil(this._destroyed), skip(1), distinctUntilChanged())
      .subscribe((floor) => {
        this.selectedFloor = floor;
        this.contextualPicture =
          floor && floor.contextualPicture
            ? this.domSanitizer.bypassSecurityTrustUrl(floor.contextualPicture)
            : null;
        this.getOfficesByFloor(floor);
        this.getSeatArchitectureOfFloor(floor);
      });
  }

  gotoArchivePage() {

    const modalRef = this.modalService.open(ArchivedListComponent, {
      width: '800px',
      disableClose: true,
      hideBtnClose: true
    });

    modalRef.afterClosed$.subscribe((result: { edited: boolean, types: string[] }) => {
      if (result.edited) {
        this.getBuildings();
        this.getFloorsByBuilding(this.selectedBuilding);
        this.getOfficesByFloor(this.selectedFloor);
      }
    })
  }

  openModalAddMeetingRoom() {
    this.openModalZone(OfficeType.MeetingRoom);
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
    this.managerOfficeViewService.reset();
  }

  private onEndSort(event: SortableEvent) {
    if (event.oldIndex === event.newIndex) {
      return;
    }

    const classNameItem = event.item.className;
    const isBuilding =
      classNameItem.indexOf('fxt-manager-office-card-building') >= 0;
    const isFloor = classNameItem.indexOf('fxt-manager-office-card-floor') >= 0;
    const isOffice =
      classNameItem.indexOf('fxt-card-office') >= 0;

    const payload = {
      buildings: isBuilding
        ? this.buildings.map((x, index) => {
          return { id: x.id, orderInList: index };
        })
        : [],
      floors: isFloor
        ? this.floors.map((x, index) => {
          return { id: x.id, orderInList: index };
        })
        : [],
      offices: isOffice
        ? this.offices.map((x, index) => {
          return { id: x.id, orderInList: index };
        })
        : [],
    };
    this.managerOfficeService.reorder(payload).subscribe((resp) => { });
  }

  onSelectBuilding(building: Building) {
    if (this.managerOfficeViewService.building.id != building.id) {
      this.managerOfficeViewService.building = building;
    } else {
      this.openModalBuildingDetails(building);
    }
  }

  openModalBuildingDetails(building: Building) {
    const modalRef = this.modalService.open(ModalDetailsBuildingComponent, {
      width: 'auto',
      height: '80%',
      escToClose: true,
      data: {
        building: building
      }
    });

    modalRef.afterClosed$.subscribe((resp) => {
      if (resp?.archived) {
        this.getBuildings();
      }
    })
  }

  onSelectFloor(floor: Floor) {
    if (this.managerOfficeViewService.floor.id != floor.id) {
      this.managerOfficeViewService.floor = floor;
    } else {
      this.openModalFloor(floor);
    }
  }

  getBuildings() {
    this.managerOfficeService.getBuildings()
      .subscribe((data) => {
        this.buildings = data.workload;
        this.managerOfficeViewService.building = this.buildings[0];
      });
  }

  getFloorsByBuilding(building: Building) {
    this.loadingFloors = true;
    this.managerOfficeService
      .getFloorsByBuilding(building.id)
      .subscribe((data) => {
        this.floors = data.workload || [];
        this.managerOfficeViewService.floor = this.floors[0];
        this.loadingFloors = false;
      });
  }

  getOfficesByFloor(floor: Floor, doSync?: boolean) {
    if (floor == null) {
      this.offices = [];
      this.meetingRooms = [];
      return;
    }
    this.loadingOffices = true;
    this.managerOfficeService.getOfficesAndMeetingRoomsByFloor(floor.id).subscribe((data) => {
      this.offices = data.workload;
      this.updateMeetingRoomsFromOffices();
      this.loadingOffices = false;
      if (doSync) {
        this.syncCapacityAndAllowedLoad();
      }
      this.cd.detectChanges();
    });
  }

  openModalBuilding(model?: any) {
    this.openAddOrEditModal(
      ManagerOfficeModalAddBuildingComponent,
      (data: any) => {
        addOrUpdateList(this.buildings, data);
        if (this.buildings.length == 1) {
          this.managerOfficeViewService.building = this.buildings[0];
        }
      },
      model
    );
  }

  openModalFloor(model?: any) {
    if (this.selectedBuilding == null) {
      this.messageService.info('notifications.create_a_building_first');
      return;
    }
    this.openAddOrEditModal(
      ManagerOfficeModalAddFloorComponent,
      (data: any) => {
        if (!data.archived) {
          addOrUpdateList(this.floors, data);
          this.contextualPicture = data.contextualPicture;

          if (this.selectedFloor?.id == data.id) {
            if (!this.seatArchitecture) {
              this.seatArchitecture = {
                id: null,
                seats: []
              } as SeatArchitecture;
            }

            this.seatArchitecture.base64Image = data.contextualPicture;
          }

          if (this.floors.length == 1) {
            this.managerOfficeViewService.floor = this.floors[0];
          }

        } else {
          this.getFloorsByBuilding(this.selectedBuilding);
        }
      },
      model
    );
  }

  openModalZone(type: OfficeType) {
    if (this.selectedBuilding == null) {
      this.messageService.info('notifications.create_a_building_first');
      return;
    }
    if (this.selectedFloor == null) {
      this.messageService.info('notifications.create_a_floor_first');
      return;
    }

    const model = { type, floor: this.selectedFloor };
    this.openAddOrEditModal(
      ManagerOfficeModalAddZoneComponent,
      (data: any) => {
        addOrUpdateList(this.offices, data);
        this.updateMeetingRoomsFromOffices();
        this.syncCapacityAndAllowedLoad();
      },
      model
    );
  }

  onSelectOffice(office: Office) {
    const config = { ...this.configModal, escToClose: true };
    config.data = {
      office: office,
      floor: this.selectedFloor
    };
    const modalRef = this.modalService.open(
      ManagerOfficeModalDetailOfficeComponent,
      config
    );
    modalRef.afterClosed$.subscribe((data) => {
      if (this.managerOfficeViewService.needReload) {
        this.getOfficesByFloor(this.managerOfficeViewService.floor, true);
        this.managerOfficeViewService.needReload = false;
      }
    });
  }

  archive(office: Office) {
    const modalRef = this.modalService.open(ArchiveConfirmationModalComponent, {
      width: '500px',
      data: {
        name: office.name,
        type: this.translocoService.translate('main.zone')
      }
    })
    modalRef.afterClosed$.subscribe((result) => {
      if (result && result.ok) {
        this.managerOfficeService.archiveOffice({ id: office.id, archiveDate: result.value }).subscribe(r => {
          if (r.errorCode === '') {
            this.messageService.success();
            this.getOfficesByFloor(this.managerOfficeViewService.floor, true);
          }
        });
      }
    });
  }

  onAddSeatOrPlaceMapMeetingRoomClicked(office: Office, seat: Seat) {
    if (office?.type == OfficeType.Normal) {
      this.openModalAddOrEditSeatComponent(office, seat);
    } else {
      this.updateMeetingRoomCoordinates(office);
    }
  }

  openModalAddOrEditSeatComponent(office: Office, seat: Seat) {
    this.highlightSeatIds = [];
    const modalRef = this.modalService.open(ModalAddSeatComponent, {
      width: '400px',
      data: {
        office: office,
        seat: seat,
        officeList: this.offices.filter(x => x.type == OfficeType.Normal)
      }
    });
    modalRef.afterClosed$.subscribe((newSeat) => {
      if (newSeat) {
        this.getSeatArchitectureOfFloor(this.selectedFloor);
        const index = this.offices.findIndex(x => x.id == office.id);
        office.seats.push(newSeat);
        this.offices[index] = { ...office, capacity: office.seats.length };
        this.syncCapacityAndAllowedLoad();
      }
    });
  }

  onDeleteSeatClicked(floor: Floor, seat: Seat) {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: '500px',
      data: {
        message: this.translocoService.translate('manager.confirmation_delete_seat')
      }
    });
    modalRef.afterClosed$.subscribe(ok => {
      if (ok) {
        this.managerSeatService.deleteSeat(floor.id, seat.id).subscribe(resp => {
          if (resp.statusCode == 0) {
            this.messageService.success();
            this.seatArchitecture.seats = this.seatArchitecture.seats.filter(x => x.id !== seat.id);
            const index = this.offices.findIndex(x => x.id == seat.office.id);
            const office = this.offices[index];
            const seats = office.seats.filter(x => x.id !== seat.id);
            this.offices[index] = { ...office, seats: seats, capacity: seats.length };
            this.syncCapacityAndAllowedLoad();
          } else {
            this.messageService.error();
          }
        })
      }
    })
  }

  onSeatHovered(seats: Seat[]) {
    this.managerOfficeViewService.hoveredSeats = seats || [];
  }

  onSeatClicked(seat: Seat) {
    this.managerOfficeViewService.clickedSeats = seat != null ? [seat] : [];
  }

  updateMeetingRoomsFromOffices() {
    this.meetingRooms = this.offices.filter(x => x.type == OfficeType.MeetingRoom)
      .map(x => {
        return {
          id: x.id, name: x.name,
          coordinate: x.coordinate,
          capacity: x.capacity
        }
      });
  }

  onModeDeskChanged(enabled: boolean) {

    let action$ = of(true);
    if (!enabled) {
      const modalRef = this.modalService.open(ModalConfirmationComponent, {
        width: '400px',
        data: {
          message: this.translocoService.translate('manager.all_desk_will_be_deleted')
        }
      });
      action$ = modalRef.afterClosed$;
    }

    action$.subscribe((ok) => {
      if (ok) {
        this.toggleDeskBooking(this.selectedFloor.id, enabled);
      } else {
        this.selectedFloor = { ...this.selectedFloor, isDeskBookingEnabled: !enabled };
      }
    })

  }

  private toggleDeskBooking(floorId: string, enabled: boolean) {
    this.managerOfficeService.toggleDeskBooking(floorId, enabled).subscribe(resp => {
      this.selectedFloor = { ...this.selectedFloor, isDeskBookingEnabled: enabled };
      this.messageService.success();
      addOrUpdateList(this.floors, this.selectedFloor);
      this.seatArchitecture = {
        ...this.seatArchitecture,
        base64Image: this.selectedFloor.contextualPicture,
        seats: []
      };
    })
  }

  private updateMeetingRoomCoordinates(office: Office) {
    const meetingRoomsToUpdate: MeetingRoomDTO = {
      id: office.id,
      name: office.name,
      coordinate: {
        xParam: 0,
        yParam: 0
      } as MeetingRoomCoordinate
    };

    this.managerOfficeService.updateCoordinates(this.selectedFloor.id, [], [meetingRoomsToUpdate])
      .subscribe(_ => {
        const index = this.offices.findIndex(x => x.id == office.id);
        this.offices[index].coordinate = { xParam: 0, yParam: 0 };
        this.offices[index] = { ...this.offices[index] };
        this.messageService.success();
      })
  }

  private openAddOrEditModal(
    component: Type<any>,
    callback: (data?: any) => void,
    model?: any
  ) {
    const config = { ...this.configModal, escToClose: true };
    config.data = {
      ...model,
      buildingId: this.selectedBuilding.id,
      floorId: this.selectedFloor?.id,
    };
    const modalRef = this.modalService.open(component, config);
    modalRef.afterClosed$.subscribe((data: Office) => {
      if (data) {
        callback(data);
      }
    });
  }

  private syncCapacityAndAllowedLoad() {
    const floorIndex = this.floors.findIndex((x) => x.id == this.selectedFloor.id);
    if (floorIndex >= 0) {
      const floor = this.floors[floorIndex];
      floor.capacity = this.offices.filter(x => x.type === OfficeType.Normal)
        .reduce((a, b) => a + b.capacity, 0);
      floor.allowedLoad = this.offices.filter(x => x.type === OfficeType.Normal)
        .reduce((a, b) => a + b.allowedLoad, 0);
      this.floors[floorIndex] = { ...floor };
    }

    const buildingIndex = this.buildings.findIndex((x) => x.id == this.selectedBuilding.id);

    if (buildingIndex >= 0) {
      const building = this.buildings[buildingIndex];
      building.capacity = this.floors.reduce((a, b) => a + b.capacity, 0);
      building.allowedLoad = this.floors.reduce((a, b) => a + b.allowedLoad, 0);
      this.buildings[buildingIndex] = { ...building };
    }
  }

  private getSeatArchitectureOfFloor(floor: Floor) {
    if (floor == null) {
      this.seatArchitecture = {} as SeatArchitecture;
      return;
    }

    this.managerSeatService.getSeatArchitecture(floor.id)
      .subscribe({
        next: (resp) => {
          this.seatArchitecture = resp.workload || {
            base64Image: floor.contextualPicture,
            seats: [],
            id: null
          };
        },
      });
  }


}
