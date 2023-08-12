import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { User } from '@flex-team/core';

@Component({
  selector: 'fxt-map-info-block-users',
  templateUrl: './map-info-block-users.component.html',
  styleUrls: ['./map-info-block-users.component.scss']
})
export class MapInfoBlockUsersComponent implements OnInit, OnChanges {

  @Input() users: User[];
  @Output() avatarClicked = new EventEmitter<User>();
  @Input() highlightUserIds: string[];

  highlightUserIdsObj: { [key: string]: boolean } = {};

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.highlightUserIds && changes.highlightUserIds.currentValue) {
      this.highlightUserIdsObj = {};
      this.highlightUserIds.forEach(k => this.highlightUserIdsObj[k] = true);
    }
  }

}
