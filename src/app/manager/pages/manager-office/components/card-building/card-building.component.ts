import {
  ChangeDetectionStrategy, Component,
  EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { Building } from '@flex-team/core';

@Component({
  selector: 'fxt-manager-office-card-building',
  templateUrl: './card-building.component.html',
  styleUrls: ['./card-building.component.scss'],
  host: {
    class: 'fxt-manager-office-card-building'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagerOfficeCardBuildingComponent implements OnInit {

  @Input() building: Building;
  @Input() selected: boolean;

  @Output() select: EventEmitter<Building> = new EventEmitter<Building>();
  @Output() detailsClicked: EventEmitter<Building> = new EventEmitter<Building>();

  constructor() { }

  ngOnInit() {
  }

  showDetails() {
    this.detailsClicked.emit(this.building);
  }

}
