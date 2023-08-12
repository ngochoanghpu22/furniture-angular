import {
  AfterViewInit,
  Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy,
  OnInit, Output, QueryList, ViewChild, ViewChildren
} from '@angular/core';
import {
  AuthenticationService, Day, MeetingRoomDTO, OccupationRuleItem, SeatArchitecture,
  SeatBookedEvent, SeatInvitedEvent, TimeSlotStateOfSeat, TimeSlotTemplateDTO, User, UserRole
} from '@flex-team/core';
import { fromEvent, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SeatComponent } from '../seat';

@Component({
  selector: 'fxt-map-seat',
  templateUrl: './map-seat.component.html',
  styleUrls: ['./map-seat.component.scss']
})
export class MapSeatComponent implements OnInit, OnDestroy {

  @ViewChild('map', { static: true }) mapRef: ElementRef;
  @ViewChildren(SeatComponent) seatComps: QueryList<SeatComponent>;

  @Input() highlightUserIds: string[] = [];
  @Input() mapSeatUsers: Map<string, User[]> = new Map();
  @Input() mapSeatTimeslots: Map<string, TimeSlotStateOfSeat[]> = new Map();
  @Input() objHighlightSeatUser: { [key: string]: boolean } = {};
  @Input() disableBookState: { [key: string]: boolean } = {};
  @Input() seatArchitecture: SeatArchitecture;
  @Input() clickedUserId: string;
  @Input() currentUser: User;
  @Input() meetingRooms: MeetingRoomDTO[];
  @Input() timeSlotTemplates: TimeSlotTemplateDTO[];
  @Input() mapOccupationRules: Map<string, OccupationRuleItem[]> = new Map();
  @Input() highlightSeatIds: string[] = [];
  @Input() currentDayStatus: Day[];

  @Output() bookClicked = new EventEmitter<SeatBookedEvent>();
  @Output() inviteClicked = new EventEmitter<SeatInvitedEvent>();
  @Output() meetingRoomClicked = new EventEmitter<MeetingRoomDTO>();
  @Output() chipClicked = new EventEmitter<any>();
  @Output() mapLoaded = new EventEmitter<void>();

  mapHeight: number;
  mapWidth: number;

  resize$: Observable<any>;
  _destroyed: Subject<void> = new Subject<void>();

  isMapLoaded = false;
  halfDayEnabled = false;

  canEditAsManager = false;

  constructor(private zone: NgZone, private authService: AuthenticationService) {
    this.resize$ = fromEvent(window, 'resize');
    this.halfDayEnabled = this.authService.IsHalfDaysEnabled;

    const isRH = this.authService.currentUserHasRole(UserRole.HRManager);
    const isOfficeManager = this.authService.currentUserHasRole(UserRole.OfficeManager);
    this.canEditAsManager = isRH || isOfficeManager;
  }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.resize$.pipe(takeUntil(this._destroyed))
        .subscribe(() => {
          this.zone.run(() => this.onResize());
        })
    })
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  onBookClicked($event: SeatBookedEvent) {
    this.bookClicked.emit($event);
  }

  onInviteClicked($event: SeatInvitedEvent) {
    this.inviteClicked.emit($event);
  }

  onLoadImg(map: any) {
    this.mapWidth = map.clientWidth;
    this.mapHeight = map.clientHeight;
    this.isMapLoaded = true;
    this.mapLoaded.emit();
  }

  onMeetingRoomClicked(meetingRoom: MeetingRoomDTO) {
    this.meetingRoomClicked.emit(meetingRoom);
  }

  onPopoverShown(id: string) {
    this.seatComps.forEach(cmp => {
      if (cmp.seat.id !== id) {
        cmp.closePopover();
      }
    })
  }

  onPopoverHidden() {
    this.highlightSeatIds = [];
  }


  hideAllPopoverSeat() {
    this.seatComps.forEach(cmp => {
      cmp.closePopover();
    })
  }

  /**
   * Open popover seat
   * @param seatId 
   * @returns 
   */
  openPopoverSeat(seatId: string): boolean {
    this.highlightSeatIds = [];
    this.hideAllPopoverSeat();
    if (seatId) {
      this.onPopoverShown(seatId);
      const cmp = this.seatComps.find(x => x.seat.id == seatId);
      if (cmp) {
        this.highlightSeatIds = [seatId];
        cmp.openPopover();
        return true;
      }
    }

    return false;
  }

  onResize() {
    const rect = (this.mapRef.nativeElement as HTMLElement).getBoundingClientRect();
    this.mapWidth = rect.width;
    this.mapHeight = rect.height;
  }

  //TOREMOVE: just for dev helper, should be removed when OK
  onImageClicked(event: Event) {
    const offsetX = (<any>event).offsetX;
    const offsetY = (<any>event).offsetY;

    const xParam = offsetX / this.mapWidth;
    const yParam = offsetY / this.mapHeight;

    console.debug(`onImageClicked, xParam = ${xParam.toFixed(3)}, yParam = ${yParam.toFixed(3)}`);
  }
}
