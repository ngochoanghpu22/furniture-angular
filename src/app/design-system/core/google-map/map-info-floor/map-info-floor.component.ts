import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MapInfoWindowFloorDTO, User } from '@flex-team/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'fxt-map-info-floor',
  templateUrl: './map-info-floor.component.html',
  styleUrls: ['./map-info-floor.component.scss']
})
export class MapInfoFloorComponent implements OnInit, OnChanges {

  @Input() floor: MapInfoWindowFloorDTO;
  @Input() highlightUserIds: string[];

  @Output() selected = new EventEmitter<any>();

  users: User[];
  seatArchitectureUrl: SafeUrl;

  constructor(
    private domSanitizer: DomSanitizer
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.floor && changes.floor.currentValue) {
      this.users = this.floor.users;
      this.seatArchitectureUrl = this.floor.seatArchitectureUrl
        ? this.domSanitizer.bypassSecurityTrustUrl(environment.accessPoint + this.floor.seatArchitectureUrl)
        : null;
    }
  }

  select(floor: MapInfoWindowFloorDTO, user?: User) {
    this.selected.emit({
      floor, user
    })
  }

}
