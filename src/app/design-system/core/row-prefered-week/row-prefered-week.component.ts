import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import {
  BookingLocationResponse,
  Day, Location, LocationChangedEvent, LocationChangedTrigger, LocationService,
  ManagerUserData, MessageService, ProfileService,
  StaticDataService, TimeSlotTemplateDTO, UpdatePreferedWeekDto, User
} from '@flex-team/core';
import { DateTime } from 'luxon';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'fxt-row-prefered-week',
  templateUrl: './row-prefered-week.component.html',
  styleUrls: ['./row-prefered-week.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RowPreferedWeekComponent implements OnInit, OnDestroy {

  @ViewChild('pop') popoverRef: PopoverDirective;

  @Input() user: User;
  @Input() halfDayEnabled: boolean;
  @Input() canEdit: boolean;
  @Input() timeSlotTemplates: TimeSlotTemplateDTO[];

  @Output() updatePreferedWeekFailed = new EventEmitter<{
    dayIndex: number,
    response: BookingLocationResponse
  }>();

  public workingDays: string[] = [];
  public dates: DateTime[] = [];

  preferedWeek: Location[] = [];
  data: ManagerUserData;
  public locations: Location[] = [];
  dayIndex: number;
  public LocationChangedTriggersEnum = LocationChangedTrigger;

  hideRowWeek = false;

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private profileService: ProfileService,
    private locationService: LocationService,
    private staticDataService: StaticDataService,
    private cd: ChangeDetectorRef,
    private messageService: MessageService
  ) {
    this.workingDays = this.staticDataService.getWorkingDays({ long: false });
    this.dates = this.staticDataService.getDatesOfWeekForGivenDate(DateTime.now(), {
      long: false, includeWeekend: false
    });

  }

  ngOnInit() {
    this.getPossibleLocations();
    this.getPreferedWeek(this.user.id);

    this.staticDataService.locationChanged$
      .pipe(takeUntil(this._destroyed))
      .subscribe(payload => {
        if (payload.trigger === LocationChangedTrigger.PreferedWeek) {
          this.changeLocation(payload.events);
        }
      })
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  trackByFn(index: number, item: any): string {
    return item.id;
  }

  public changeLocation($events: LocationChangedEvent[]) {

    if (this.dayIndex == null) return;

    const event = $events[0];
    const dto = <UpdatePreferedWeekDto>{
      userId: this.user.id,
      dayIndex: this.dayIndex,
      locationId: event.location.id
    };
    this.updatePreferedWeek(dto);
  }

  /**
   * Get possible locations to choose
   */
  private getPossibleLocations() {
    this.locationService.getLocations()
      .subscribe(resp => {
        this.locations = resp.workload;
      });
  }

  /**
   * Get prefered week of an user
   * @param userId 
   */
  private getPreferedWeek(userId: string) {
    this.profileService.getPreferedWeek(userId).subscribe((resp) => {
      this.hideRowWeek = resp.workload.some(x => x == null);
      this.preferedWeek = resp.workload;

      const data = new ManagerUserData();
      data.days = [];
      const locations: Day[][] = resp.workload.map(x => {
        const d = new Day();
        d.selectedRemoteLocationId = x?.id;
        return [d];
      });

      data.days = locations;

      this.data = data;
      this.cd.detectChanges();
    });
  }

  /**
   * Save prefered week
   * @param index 
   * @param loc 
   */
  private updatePreferedWeek(dto: UpdatePreferedWeekDto) {
    this.profileService.updatePreferedWeek(dto).subscribe((resp) => {
      if (resp.workload.canBook) {
        this.getPreferedWeek(dto.userId);
        this.messageService.success();

        if (this.popoverRef) {
          this.popoverRef.hide();
        }

        this.staticDataService.notifyUserProfileChanged();

      } else {
        this.updatePreferedWeekFailed.emit({
          dayIndex: dto.dayIndex,
          response: resp.workload
        });
      }
    })
  }


}
