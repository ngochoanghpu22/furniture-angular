import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MeetingRoomDTO } from '@flex-team/core';

@Component({
  selector: 'fxt-manager-map-card-meeting-room',
  templateUrl: './card-meeting-room.component.html',
  styleUrls: ['./card-meeting-room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardMeetingRoomComponent implements OnInit {

  @Input() meetingRoom: MeetingRoomDTO;

  @Output() clicked = new EventEmitter<MeetingRoomDTO>();

  isEquipmentCollapsed = true;

  constructor() { }

  ngOnInit() {
  }

  onMeetingRoomClicked() {
    this.clicked.emit(this.meetingRoom);
  }

}
