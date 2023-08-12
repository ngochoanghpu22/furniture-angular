import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AuthenticationService, BookingLocationRequest,
  Location, LocationDetailDTO, LocationService,
  ManagerCalendarService, ManagerFilter, ManagerMapContext,
  ManagerMapViewService, ManagerSettingService,
  ManagerUserData,
  MessageService, StaticDataService, Team, User, Workload
} from '@flex-team/core';
import { DateTime } from 'luxon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProcessingLocationService } from 'src/app/processing-location.service';
import _ from 'underscore';

type UserLocationPair = {
  user: User,
  location: Location
}

@Component({
  selector: 'fxt-manager-map-sidebar',
  templateUrl: './map-sidebar.component.html',
  styleUrls: ['./map-sidebar.component.scss']
})
export class MapSidebarComponent implements OnInit, OnDestroy {

  selectedDate: Date;
  locationWithUsers: any[] = [];
  inOfficeLocationsWithUser: any;
  otherLocationsWithUsers: any[] = [];

  locations: Location[] = [];
  currentUser: User;
  consolidatedCoreTeam: { name: string, mandatoryOfficeDays: boolean[] };

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private locationService: LocationService,
    private managerMapViewService: ManagerMapViewService,
    private authService: AuthenticationService,
    private managerCalendarService: ManagerCalendarService,
    private messageService: MessageService,
    private staticDataService: StaticDataService,
    private processingLocationService: ProcessingLocationService,
    private managerSettingService: ManagerSettingService
  ) {
  }

  ngOnInit() {

    this.getCoreTeamOfUser(this.authService.currentUser.id);

    this.authService.currentUser$.pipe(takeUntil(this._destroyed))
      .subscribe(data => {
        this.currentUser = data;
      })

    this.managerMapViewService.context$.pipe(takeUntil(this._destroyed))
      .subscribe((context: ManagerMapContext) => {
        const firstLoad = !this.selectedDate;
        if (firstLoad || this.selectedDate.getTime() != context.date.getTime()) {
          this.selectedDate = context.date;
          this.getPossibleLocations();
        }
      })

  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  onDateChanged(event: any) {
    this.managerMapViewService.date = event;
  }

  onLocationConfirmClicked(location: Location) {
    this.changeToLocation(location);
  }

  private getCoreTeamOfUser(userId: string) {
    this.managerSettingService.getHierarchyTeamsThatUserOwnedOrBelongTo(userId)
      .subscribe((resp: Workload<Team[]>) => {
        this.consolidatedCoreTeam = {
          name: resp.workload.map(x => x.name).join(', '),
          mandatoryOfficeDays: this.staticDataService.getConsolidatedMandatoryOfficeDays(resp.workload)
        }
      })
  }

  private changeToLocation(location: Location) {

    const locationDto = {
      target: location.id,
      targetLocation: location,
      seatId: null,
      doLeave: false
    } as LocationDetailDTO;

    const request: BookingLocationRequest = {
      userId: this.currentUser.id,
      date: this.selectedDate,
      dayIndex: 0,
      locations: [locationDto]
    } as BookingLocationRequest;

    this.processingLocationService.trySaveLocationOrBookSeat(request, this.consolidatedCoreTeam)
      .subscribe(resp => {
        if (!resp.errorCode) {
          if (resp.workload != null) {
            this.getLocationsWholeCompany(this.selectedDate, true);
            this.messageService.success();
          }
        } else {
          this.messageService.error(`message_error.${resp.errorCode}`);
        }
      })

  }

  private getLocationsWholeCompany(date: Date, forceReload?: boolean) {
    const filter = new ManagerFilter(DateTime.fromJSDate(date), DateTime.fromJSDate(date), [])
    this.managerCalendarService
      .getLocationsWholeCompany(filter)
      .subscribe((resp) => {
        const users = resp.workload.map(x => x.users[0]);
        const userWithLocations = users.map((x: ManagerUserData) => <UserLocationPair>{
          location: x.days[0][0] ? <Location>{
            id: x.days[0][0].selectedRemoteLocationId,
            name: x.days[0][0].selectedRemoteLocation,
            address: x.days[0][0].selectedRemoteLocationAddress,
            inOffice: (x.days[0][0]).inOffice,
            orderInList: (x.days[0][0]).orderInList,
            isConfirmed: (x.days[0][0]).isConfirmed,
            color: (x.days[0][0]).color
          } : null,
          user: <User>{
            id: x.id,
            fullName: x.fullName,
            email: x.email,
            tinyPicture: x.tinyPicture,
            isOnboarded: x.isOnboarded
          }
        });

        this._retrieveFriendLocations(userWithLocations);

        if (forceReload) {
          this.selectedDate = new Date(this.selectedDate);
        }
      });
  }

  private _retrieveFriendLocations(workload: UserLocationPair[]) {
    this.locationWithUsers = _.chain(workload)
      .groupBy((l) => l.location && l.location.name)
      .map((value, key) => ({
        location: value[0].location,
        users: value.map(x => x.user)
      }))
      .filter(x => x.location != null)
      .value();

    this.inOfficeLocationsWithUser = this.locationWithUsers.filter(x => x.location.inOffice)[0];

    const notOfficeLocations = this.locationWithUsers.filter(x => !x.location.inOffice);
    this.otherLocationsWithUsers = [];
    this.locations.filter(x => !x.inOffice).forEach(loc => {
      const found = notOfficeLocations.find(x => x.location.id == loc.id);
      if (found) {
        this.otherLocationsWithUsers.push(found);
      } else {
        this.otherLocationsWithUsers.push({
          location: loc,
          users: []
        })
      }
    });

  }

  private getPossibleLocations() {
    this.locationService.getLocations()
      .subscribe(resp => {
        this.locations = resp.workload;
        this.getLocationsWholeCompany(this.selectedDate);
      });
  }

}
