import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { DndMapSeatsComponent } from '@design-system/core';
import { Floor, ManagerOfficeService, MeetingRoomDTO, MessageService, Seat, SeatArchitecture } from '@flex-team/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ManagerOfficeViewService } from '../../services';

@Component({
  selector: 'fxt-manager-office-floor-map',
  templateUrl: './floor-map.component.html',
  styleUrls: ['./floor-map.component.scss']
})
export class FloorMapComponent implements OnInit, OnDestroy {

  @ViewChild('dndMapSeats', { static: false }) dndMapSeatsRef: DndMapSeatsComponent;
  @ViewChild('fileInput') fileInputRef: ElementRef;

  @Input() floor: Floor;
  @Input() contextualPicture: SafeUrl;
  @Input() seatArchitecture: SeatArchitecture;
  @Input() meetingRooms: MeetingRoomDTO[];

  @Output() modeChanged = new EventEmitter<any>();
  @Output() editSeatClicked = new EventEmitter<Seat>();
  @Output() deleteSeatClicked = new EventEmitter<Seat>();

  mapHeight: number;
  mapWidth: number;
  isMapLoaded = false;

  seatsToUpdate: Seat[] = [];
  meetingRoomsToUpdate: MeetingRoomDTO[] = [];
  hasChanges = false;

  hoveredSeats: Seat[];
  clickedSeats: Seat[];

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private domSanitizer: DomSanitizer,
    private managerOfficeService: ManagerOfficeService,
    private messageService: MessageService,
    private cd: ChangeDetectorRef,
    private managerOfficeViewService: ManagerOfficeViewService,
  ) { }

  ngOnInit() {
    this.managerOfficeViewService.hoveredSeats$
      .pipe(takeUntil(this._destroyed)).subscribe(data => {
        this.hoveredSeats = data;
      });

    this.managerOfficeViewService.clickedSeats$
      .pipe(takeUntil(this._destroyed)).subscribe(data => {
        this.clickedSeats = data;
      });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  onModeDeskChanged($event: any) {
    if (!$event) {
      this.dndMapSeatsRef.reset();
    }
    this.modeChanged.emit($event);
  }

  onLoadImg(map: any) {
    this.mapWidth = map.clientWidth;
    this.mapHeight = map.clientHeight;
    this.isMapLoaded = true;
  }

  changeFloorMap(files: any) {
    if (!this.floor) return;

    if (files.length === 0) return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    var reader = new FileReader();
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {

      this.floor.contextualPicture = (<any>reader).result;
      this.contextualPicture = this.domSanitizer.bypassSecurityTrustUrl(
        (<any>reader).result
      );

      if (this.seatArchitecture) {
        this.seatArchitecture.base64Image = (<any>reader).result;
      } else {
        this.seatArchitecture = {
          base64Image: (<any>reader).result
        } as SeatArchitecture
      }

      this.managerOfficeService.addOrEditFloor(this.floor)
        .pipe(finalize(() => this.resetInputFile()))
        .subscribe((resp) => {
          if (!resp.errorCode) {
            this.seatArchitecture.base64Image = resp.workload.contextualPicture;
            this.contextualPicture = resp.workload.contextualPicture
            this.messageService.success();
          }
        });

    };
  }

  onMapSeatsChanged($event: {
    seats: Seat[],
    meetingRooms: MeetingRoomDTO[]
  }) {
    this.seatsToUpdate = $event.seats;
    this.meetingRoomsToUpdate = $event.meetingRooms;
    this.hasChanges = this.seatsToUpdate.length + this.meetingRoomsToUpdate.length > 0;
  }

  onEditSeatClicked(seat: Seat) {
    this.editSeatClicked.emit(seat);
  }

  onDeleteSeatClicked(seat: Seat) {
    this.deleteSeatClicked.emit(seat);
  }

  saveSeats() {
    this.managerOfficeService.updateCoordinates(this.floor.id, this.seatsToUpdate,
      this.meetingRoomsToUpdate)
      .pipe(finalize(() => {
        this.hasChanges = false;
        this.meetingRoomsToUpdate = [];
        this.seatsToUpdate = [];
      }))
      .subscribe(_ => {
        this.messageService.success();
      })
  }

  reset() {
    this.meetingRooms = [...this.meetingRooms];
    this.seatArchitecture = {
      ...this.seatArchitecture,
      seats: [...this.seatArchitecture.seats]
    };
    this.seatsToUpdate = [];
    this.meetingRoomsToUpdate = [];
  }

  private resetInputFile() {
    this.fileInputRef.nativeElement.value = null;
  }

}
