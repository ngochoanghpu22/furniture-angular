import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MeetingRoomDTO } from '@flex-team/core';

@Component({
  selector: 'fxt-meeting-room',
  templateUrl: './meeting-room.component.html',
  styleUrls: ['./meeting-room.component.scss']
})
export class MeetingRoomComponent implements OnInit {

  @Input() meetingRoom: MeetingRoomDTO;
  @Output() clicked = new EventEmitter<MeetingRoomDTO>();

  constructor() { }

  ngOnInit() {
  }

}
