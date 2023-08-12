import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SwiperModule } from 'swiper/angular';
import { CircleDayModule } from '../circle-day';
import { TranslocoRootModule } from '../transloco';
import { CalendarNavComponent } from './calendar-nav/calendar-nav.component';
import { CalendarComponent } from './calendar.component';

const components = [
  CalendarNavComponent,
  CalendarComponent
]

@NgModule({
  imports: [
    CommonModule,
    CircleDayModule,
    SwiperModule,
    TranslocoRootModule
  ],
  declarations: [...components],
  exports: [...components]
})
export class CalendarModule { }
