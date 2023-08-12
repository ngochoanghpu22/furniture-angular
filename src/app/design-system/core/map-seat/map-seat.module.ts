import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DirectivesModule } from '../directives';
import { MeetingRoomModule } from '../meeting-room';
import { SeatModule } from '../seat';
import { MapSeatComponent } from './map-seat.component';

@NgModule({
  imports: [
    CommonModule,
    SeatModule,
    MeetingRoomModule,
    DirectivesModule
  ],
  declarations: [MapSeatComponent],
  exports: [MapSeatComponent]
})
export class MapSeatModule { }
