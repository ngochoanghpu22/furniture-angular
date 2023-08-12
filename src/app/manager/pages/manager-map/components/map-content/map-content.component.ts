import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuthenticationService, Building, ManagerMapContext,
  ManagerMapViewService, ManagerOfficeService, ManagerSeatService,
  ManagerViewService, MapInfoWindowFloorDTO, MapInfoWindowUserDTO,
  MapPin, MapPinType, MessageService, PlanService, SelectionItem, User, Workload
} from '@flex-team/core';
import { DateTime } from 'luxon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'fxt-manager-map-content',
  templateUrl: './map-content.component.html',
  styleUrls: ['./map-content.component.scss']
})
export class MapContentComponent implements OnInit, OnDestroy {

  selectedDate: Date;

  highlightUserIds: string[] = [];
  buildings: Building[];
  buildingsInMap: Building[];
  usersInMap: MapInfoWindowUserDTO[];

  private _destroyed: Subject<void> = new Subject<void>();

  tags: SelectionItem[];
  mapPinsInMap: MapPin[];
  allPinsInMap: MapPin[];
  isNeoNomadLayerEnabled = false;
  showMapPins = false;

  neoNomadInit = false;

  constructor(private managerMapViewService: ManagerMapViewService,
    private managerSeatService: ManagerSeatService,
    private managerViewService: ManagerViewService,
    private managerOfficeService: ManagerOfficeService,
    private planService: PlanService,
    private router: Router,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute
  ) {
    this.isNeoNomadLayerEnabled = this.authService.IsNeoNomadLayerEnabled;
  }

  ngOnInit() {
    this.activatedRoute.data.pipe(takeUntil(this._destroyed))
      .subscribe((data) => {
        this.buildings = data.buildings.workload;
        this.buildingsInMap = this.buildings.filter(x => x.lat != null && x.lng != null);
      });

    this.managerMapViewService.context$.pipe(takeUntil(this._destroyed))
      .subscribe((context: ManagerMapContext) => {
        const firstLoad = !this.selectedDate;
        if (firstLoad || this.selectedDate.getTime() != context.date.getTime()) {
          this.selectedDate = context.date;
          this.getMapInfoWindowUsers(this.selectedDate);
        }
      });

    this.managerMapViewService.selection$.pipe(takeUntil(this._destroyed))
      .subscribe(selection => {
        this.tags = selection;
      });

  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  toggleShowMapPins() {
    if (this.showMapPins) {
      this.getMapPinFromType(MapPinType.NeoNomad);
    } else {
      this.mapPinsInMap = [];
    }
  }

  onClusteringend() {
    if (this.showMapPins && !this.neoNomadInit) {
      this.neoNomadInit = true;
      this.messageService.info('main.neonomad_layer_loaded');
    }
  }

  onSelectionChanged(selection: SelectionItem[]) {
    this.managerViewService.selection = selection;
    this.getHighlightUserIds(selection);
  }

  getHighlightUserIds(selection: SelectionItem[]) {
    this.managerSeatService.getHighlightUsers(selection).subscribe(resp => {
      this.highlightUserIds = resp.workload;
      this.managerMapViewService.highlightUserIds = resp.workload;
    })
  }

  goToDetail($event: { building: Building, floor: MapInfoWindowFloorDTO, user: User }) {
    const { building, floor, user } = $event;
    this.managerMapViewService.selectedFloor = floor;
    this.managerMapViewService.clickedUserId = user?.id;

    this.router.navigate([`./manager/plan/${building.id}`]);

  }

  private getMapInfoWindowUsers(date: Date) {
    this.managerOfficeService.getMapInfoWindowUsers(DateTime.fromJSDate(date))
      .subscribe((resp: Workload<MapInfoWindowUserDTO[]>) => {
        this.usersInMap = resp.workload;
      })
  }

  /**
   * Call API to get list map pin NeoNomad by type
   */
  private getMapPinFromType(type: MapPinType) {
    if (this.isNeoNomadLayerEnabled) {
      if (this.allPinsInMap) {
        this.mapPinsInMap = this.allPinsInMap;
      } else {
        this.planService.getMapPinFromType(type)
          .subscribe((data: Workload<MapPin[]>) => {
            this.mapPinsInMap = this.allPinsInMap = data.workload;
          });
      }
    }
  }

}
