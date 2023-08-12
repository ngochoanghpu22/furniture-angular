import { Component, OnInit } from '@angular/core';
import { Building } from '@flex-team/core';

@Component({
  selector: 'app-manager-map',
  templateUrl: './manager-map.component.html',
  styleUrls: ['./manager-map.component.scss']
})
export class ManagerMapComponent implements OnInit {

  buildings: Building[] = [];

  constructor(
  ) {

  }

  ngOnInit() {
  }

}
