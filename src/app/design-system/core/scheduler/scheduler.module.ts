import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { DirectivesModule } from '../directives';
import { SchedulerComponent } from './scheduler.component';

FullCalendarModule.registerPlugins([
  timeGridPlugin,
  interactionPlugin
]);

@NgModule({
  imports: [
    CommonModule,
    DirectivesModule,
    FullCalendarModule
  ],
  declarations: [SchedulerComponent],
  exports: [SchedulerComponent]
})
export class SchedulerModule { }
