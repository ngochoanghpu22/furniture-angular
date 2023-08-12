import { Component, OnInit } from '@angular/core';
import { ModalConfig } from '@design-system/core';
import {
  Building, ManagerOfficeService,
  MapInfoWindowUserDTO, Workload
} from '@flex-team/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'fxt-modal-google-map',
  templateUrl: './modal-google-map.component.html',
  styleUrls: ['./modal-google-map.component.scss']
})
export class ModalGoogleMapComponent implements OnInit {

  selectedDate: Date;

  highlightUserIds: string[] = [];
  buildings: Building[] = [];
  buildingsInMap: Building[] = [];
  usersInMap: MapInfoWindowUserDTO[] = [];

  constructor(
    private managerOfficeService: ManagerOfficeService,
    private modalConfig: ModalConfig
  ) {
    this.selectedDate = this.modalConfig.data.selectedDate as Date;
  }

  ngOnInit() {
    this.getBuildings();
    this.getMapInfoWindowUsers(this.selectedDate);
  }

  private getBuildings() {
    this.managerOfficeService.getBuildings().subscribe((resp) => {
      this.buildings = resp.workload;
      this.buildingsInMap = this.buildings.filter(x => x.lat != null && x.lng != null);
    })
  }

  private getMapInfoWindowUsers(date: Date) {
    this.managerOfficeService.getMapInfoWindowUsers(DateTime.fromJSDate(date))
      .subscribe((resp: Workload<MapInfoWindowUserDTO[]>) => {
        this.usersInMap = resp.workload;
      })
  }

}
