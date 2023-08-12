import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DirectivesModule } from '../directives';
import { MeetingRoomComponent } from './meeting-room.component';

@NgModule({
  imports: [
    CommonModule,
    DirectivesModule
  ],
  declarations: [MeetingRoomComponent],
  exports: [MeetingRoomComponent]
})
export class MeetingRoomModule { }
