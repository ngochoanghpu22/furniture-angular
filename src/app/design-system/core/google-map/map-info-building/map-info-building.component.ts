import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import {
  Building, ManagerOfficeService, MapInfoWindowBuildingDTO,
  MapInfoWindowFloorDTO, User, Workload
} from '@flex-team/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'fxt-map-info-building',
  templateUrl: './map-info-building.component.html',
  styleUrls: ['./map-info-building.component.scss']
})
export class MapInfoBuildingComponent implements OnInit, OnChanges {

  @Input() building: Building;
  @Input() selectedDate: Date;
  @Input() highlightUserIds: string[];

  @Output() itemClicked = new EventEmitter<{
    building: Building,
    floor: MapInfoWindowFloorDTO,
    user: User
  }>();
  @Output() collapsed = new EventEmitter<boolean>();

  users: User[];
  floors: MapInfoWindowFloorDTO[];

  showDetail = false;

  constructor(private managerOfficeService: ManagerOfficeService) {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedDate && changes.selectedDate.currentValue) {
      this.getMapInfoWindowBuilding(this.building.id, this.selectedDate);
    }
  }

  onArrowClicked() {
    this.showDetail = !this.showDetail;
    this.collapsed.emit(this.showDetail);
  }

  onItemSelected(building: Building, floor: MapInfoWindowFloorDTO, user: User) {
    this.itemClicked.emit({ building, floor, user });
  }

  private getMapInfoWindowBuilding(buildingId: string, date: Date) {
    this.users = null;
    this.managerOfficeService.getMapInfoWindowBuilding(buildingId, DateTime.fromJSDate(date))
      .subscribe((resp: Workload<MapInfoWindowBuildingDTO>) => {
        this.floors = resp.workload.floors;
        this.users = [];
        if (resp.workload.floors != null) {
          resp.workload.floors.forEach(x => this.users.push(...x.users));
        }
      })
  }

}
