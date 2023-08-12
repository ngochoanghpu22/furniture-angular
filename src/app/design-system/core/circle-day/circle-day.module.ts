import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DirectivesModule } from '../directives';
import { GaugeModule } from '../gauge';
import { LocationStatusModule } from '../location-status';
import { CircleDayComponent } from './circle-day.component';

@NgModule({
  imports: [
    CommonModule,
    GaugeModule,
    DirectivesModule,
    LocationStatusModule
  ],
  declarations: [CircleDayComponent],
  exports: [CircleDayComponent]
})
export class CircleDayModule { }
