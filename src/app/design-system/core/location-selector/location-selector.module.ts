import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DirectivesModule } from '../directives';
import { DropdownModule } from '../dropdown';
import { LocationStatusModule } from '../location-status';
import { LocationSelectorComponent } from './location-selector.component';

@NgModule({
  imports: [
    CommonModule,
    DropdownModule,
    DirectivesModule,
    LocationStatusModule
  ],
  declarations: [LocationSelectorComponent],
  exports: [LocationSelectorComponent]
})
export class LocationSelectorModule { }
