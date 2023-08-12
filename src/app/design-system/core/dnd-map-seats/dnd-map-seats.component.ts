import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { addOrUpdateList, MeetingRoomDTO, NameValuePair, Seat } from '@flex-team/core';
import ResizeObserver from 'resize-observer-polyfill';
import { SeatComponent } from '../seat';

const PointSeatRadius = 10; //Size 20px x 20px

export enum DndMapSeatsGridDegree {
  Zero = 1, // 0°
  Quarter, // 12,5°
  Half //45°
}

@Component({
  selector: 'fxt-dnd-map-seats',
  templateUrl: './dnd-map-seats.component.html',
  styleUrls: ['./dnd-map-seats.component.scss'],
  host: {
    class: 'fxt-dnd-map-seats'
  }
})
export class DndMapSeatsComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChildren(SeatComponent) seatComps: QueryList<SeatComponent>;

  @Input() base64Image: SafeUrl;
  @Input() seats: Seat[];
  @Input() meetingRooms: MeetingRoomDTO[];
  @Input() hoveredSeats: Seat[];
  @Input() clickedSeats: Seat[];
  @Input() hideMarkers = false;
  @Input() disableGrid = false;

  @Output() editSeatClicked = new EventEmitter<Seat>();
  @Output() deleteSeatClicked = new EventEmitter<Seat>();

  @Output() changed = new EventEmitter<{
    seats: Seat[],
    meetingRooms: MeetingRoomDTO[]
  }>();

  mapHeight: number;
  mapWidth: number;
  isMapLoaded = false;

  seatsToUpdate: Seat[] = [];
  meetingRoomsToUpdate: MeetingRoomDTO[] = [];

  DndMapSeatsGridDegreeEnum = DndMapSeatsGridDegree;

  gridDegree: DndMapSeatsGridDegree = DndMapSeatsGridDegree.Zero;
  displayGrid = false;
  hasChanges = false;

  meetingRoomsHavingCoordinates: MeetingRoomDTO[];

  degreeOptions: NameValuePair[] = [
    { name: '90°', value: DndMapSeatsGridDegree.Zero },
    { name: '12,5°', value: DndMapSeatsGridDegree.Quarter },
    { name: '45°', value: DndMapSeatsGridDegree.Half },
  ];

  private resizeObserver: ResizeObserver;
  private mapElement: HTMLElement;

  objHighlightSeatIds: { [key: string]: boolean } = {};

  constructor(
    private cd: ChangeDetectorRef,
    private elementRef: ElementRef,
    private zone: NgZone
  ) {
    this.resizeObserver =
      new ResizeObserver(this.resizeCallback.bind(this));
  }

  ngOnInit() {
    this.mapElement = (this.elementRef.nativeElement as HTMLElement).querySelector('.fxt-dnd-map-seats-wrapper');
    this.resizeObserver.observe(this.mapElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hoveredSeats && this.hoveredSeats) {
      this.objHighlightSeatIds = {};
      this.hoveredSeats.forEach(x => this.objHighlightSeatIds[x.id] = true);
    }

    if (changes.clickedSeats && this.clickedSeats && this.clickedSeats.length > 0) {
      this.openPopoverSeat(this.clickedSeats[0].id);
    }

    if(changes.meetingRooms && this.meetingRooms){
      this.meetingRoomsHavingCoordinates = this.meetingRooms.filter(x => x.coordinate != null);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.unobserve(this.mapElement);
    }
  }

  reset() {
    this.displayGrid = false;
    this.cd.detectChanges();
  }

  onLoadImg(map: any) {
    this.mapWidth = map.clientWidth;
    this.mapHeight = map.clientHeight;
    this.isMapLoaded = true;
  }

  resizeCallback(event: any) {
    this.zone.run(() => {
      const contentRect = event[0].contentRect;
      this.mapWidth = contentRect.width;
      this.mapHeight = contentRect.height;
    })
  }

  allowDrop(ev: any) {
    ev.preventDefault();
  }

  drag(ev: any, model: Seat | MeetingRoomDTO, isMeetingRoom: boolean) {
    ev.dataTransfer.setData("id", model.id);
    ev.dataTransfer.setData("isMeetingRoom", isMeetingRoom);
  }

  drop(ev: any) {
    ev.preventDefault();
    const xParam = ((ev.offsetX - PointSeatRadius) * 1000 / this.mapWidth) / 1000;
    const yParam = ((ev.offsetY - PointSeatRadius) * 1000 / this.mapHeight) / 1000;

    const id = ev.dataTransfer.getData("id");
    const isMeetingRoom = ev.dataTransfer.getData("isMeetingRoom");

    if (isMeetingRoom == 'false') {
      const seat = this.seats.find(x => x.id == id);
      seat.xParam = xParam;
      seat.yParam = yParam;
      addOrUpdateList(this.seatsToUpdate, seat);
    } else {
      const meetingRoom = this.meetingRooms.find(x => x.id == id);
      meetingRoom.coordinate = {
        xParam, yParam
      };
      addOrUpdateList(this.meetingRoomsToUpdate, meetingRoom);
    }
    this.hasChanges = true;
    this.notifyChanges();
  }

  private hideAllPopoverSeat() {
    this.seatComps.forEach(cmp => {
      cmp.closePopover();
    })
  }

  onPopoverShown(id: string) {
    this.seatComps.forEach(cmp => {
      if (cmp.seat.id !== id) {
        cmp.closePopover();
      }
    })
  }

  private openPopoverSeat(seatId: string) {
    if(!this.seatComps) return;
    this.hideAllPopoverSeat();
    if (seatId) {
      this.onPopoverShown(seatId);
      const cmp = this.seatComps.find(x => x.seat.id == seatId);
      if (cmp) {
        cmp.openPopover();
      }
    }
  }

  private notifyChanges() {
    this.changed.emit({
      seats: this.seatsToUpdate,
      meetingRooms: this.meetingRoomsToUpdate
    })
  }

}
