import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { DirectivesModule } from '../directives';
import { LocationPanelModule } from '../location-panel';
import { LocationStatusModule } from '../location-status';
import { RowPreferedWeekComponent } from './row-prefered-week.component';

@NgModule({
  imports: [
    CommonModule,
    DirectivesModule,
    LocationPanelModule,
    PopoverModule,
    LocationStatusModule
  ],
  declarations: [
    RowPreferedWeekComponent
  ],
  exports: [RowPreferedWeekComponent],
})
export class RowPreferedWeekModule { }
