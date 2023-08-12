import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DndMapSeatsComponent } from './dnd-map-seats.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { SeatModule } from '../seat';
import { MeetingRoomModule } from '../meeting-room';
import { RadioGroupModule } from '../radio-group';
import { SwitchModule } from '../switch/switch.module';

@NgModule({
  imports: [
    CommonModule,
    TooltipModule,
    FormsModule,
    TranslocoModule,
    SeatModule,
    MeetingRoomModule,
    RadioGroupModule,
    SwitchModule
  ],
  declarations: [DndMapSeatsComponent],
  exports: [DndMapSeatsComponent],
})
export class DndMapSeatsModule { }
