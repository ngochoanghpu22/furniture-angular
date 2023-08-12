import {
  AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy,
  OnInit, Output, SimpleChanges
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthenticationService, Building, Floor,
  LocationService, ManagerMapContext, ManagerMapViewService, SelectionItem
} from '@flex-team/core';
import { DateTime } from 'luxon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'fxt-manager-map-detail-sidebar',
  templateUrl: './detail-sidebar.component.html',
  styleUrls: ['./detail-sidebar.component.scss'],
  host: {
    '[class.mode-modal]': 'modeModal'
  }
})
export class DetailSidebarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {

  @Input() buildings: Building[];
  @Input() building: Building;
  @Input() modeModal: boolean;
  @Input() selectedDate: Date;

  @Output() buildingClicked = new EventEmitter<Building>();

  floors: any[] = [];
  selectedFloor: Partial<Floor>;
  formatDate: string;

  private _destroyed: Subject<void> = new Subject<void>();

  private _state: any;

  constructor(
    private locationService: LocationService,
    private router: Router,
    private managerMapViewService: ManagerMapViewService,
    private authService: AuthenticationService
  ) {

    this.managerMapViewService.context$.pipe(takeUntil(this._destroyed))
      .subscribe((context: ManagerMapContext) => {
        this.selectedFloor = context.selectedFloor;
      });

    this.formatDate = this.authService.formatDate;

  }

  ngOnInit() {
    this.managerMapViewService.forceLoad$.pipe(takeUntil(this._destroyed)).subscribe(_ => {
      this.loadFloors(DateTime.fromJSDate(this.selectedDate), false);
    });

    this.managerMapViewService.clickedUserId$.pipe(takeUntil(this._destroyed))
      .subscribe(clickedUserId => {
        if (clickedUserId) {
          const floorOfPerson = this.findFloorOfPerson(clickedUserId);
          if (floorOfPerson != null && this.selectedFloor.id !== floorOfPerson.id) {
            this.onFloorClicked(floorOfPerson);
          }
        }
      })
  }

  /**
   * Find floor and display popover seat of person
   * @param userId 
   */
  private findFloorOfPerson(userId: string): Floor {
    for(let f of this.floors){
      for(let o of f.offices){
        for(let u of o.users){
          for(let l of u.load){
            if(l.load.indexOf(userId) >= 0){
              return f;
            }
          }
        }
      }
    }

    return null;
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.building && this.building) {
      this.selectedFloor = null;
      this.loadFloors(DateTime.fromJSDate(this.selectedDate), true);
    }

    if (changes.selectedDate && this.selectedDate && this.building) {
      this.loadFloors(DateTime.fromJSDate(this.selectedDate), false);
    }
  }

  ngAfterViewInit(): void {
    if (this._state && this._state.userId && this._state.seatId) {
      setTimeout(() => {
        this.managerMapViewService.clickedUserId = this._state.userId;
      })
    }
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    this.managerMapViewService.selectedFloor = null;
    this.managerMapViewService.floors = [];
  }

  onFloorClicked(floor: Partial<Floor>) {
    this.managerMapViewService.selectedFloor = floor;
  }

  private loadFloors(target: DateTime, firstLoad: boolean) {
    this.locationService.getLocationLoadBetweenDate(this.building.id, target, target)
      .subscribe(resp => {
        this.floors = this.factoryFloors(resp.workload);

        if (firstLoad) {
          this.managerMapViewService.context = <ManagerMapContext>{
            date: this.selectedDate,
            selectedFloor: this.selectedFloor || this.floors[0],
            floors: this.floors,
            metadataTemplate: resp.workload.metadataTemplate
          }
        }
      });
  }

  onDateChanged(event: any) {
    if (this.selectedDate != event) {
      this.managerMapViewService.date = event;
    }
  }

  selectBuilding(building: Building) {
    this.buildingClicked.emit(building);
  }

  back() {
    if (!this.modeModal) {
      this.router.navigate([`./manager/plan`]);
    }
  }

  private factoryFloors(dto: any): any[] {
    const floors: Partial<Floor>[] = [];
    this.building.actualLoad = dto.actualLoad[0];

    dto.children.forEach((item: any, index: number) => {

      let actualLoadOfFloor = 0;
      Object.values(item.actualLoad[0]).forEach((x: any) => actualLoadOfFloor += x[0]);

      const floor: any = {
        id: item.id,
        actualLoad: actualLoadOfFloor,
        address: item.address,
        name: item.name,
        allowedLoad: item.maxPlaceAvailable,
        capacity: item.maxPerson,
        offices: []
      }

      item.children.forEach((item2: any, index2: number) => {

        let actualLoadOfOffice = 0;
        Object.values(item2.actualLoad[0]).forEach((x: any) => actualLoadOfOffice += x[0]);

        const office: any = {
          id: item2.id,
          actualLoad: actualLoadOfOffice,
          address: item2.address,
          name: item2.name,
          allowedLoad: item2.maxPlaceAvailable,
          capacity: item2.maxPerson,
          users: item2.userReservationLoad
        }
        floor.offices.push(office);
      })

      floors.push(floor);

    });
    return floors;
  }

}
