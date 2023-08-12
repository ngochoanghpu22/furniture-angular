import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { DirectivesModule } from '../directives';
import { LocationStatusModule } from '../location-status';
import { MapSeatModule } from '../map-seat';
import { SpinnerModule } from '../spinner';
import { SwitchModule } from '../switch';
import { TranslocoRootModule } from '../transloco';
import { LocationPanelComponent } from './location-panel.component';
import { ModalSelectionSeatComponent } from './modal-selection-seat/modal-selection-seat.component';

@NgModule({
  imports: [
    CommonModule, DirectivesModule,
    TranslocoRootModule, SpinnerModule,
    MapSeatModule,
    SwitchModule,
    FormsModule,
    PopoverModule,
    LocationStatusModule
  ],
  declarations: [
    LocationPanelComponent,
    ModalSelectionSeatComponent
  ],
  exports: [
    LocationPanelComponent,
    ModalSelectionSeatComponent
  ]
})
export class LocationPanelModule { }
