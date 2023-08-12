import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MapInfoBlockUsersModule } from '../map-info-block-users';
import { MapInfoFloorComponent } from './map-info-floor.component';

@NgModule({
  imports: [
    CommonModule,
    MapInfoBlockUsersModule
  ],
  declarations: [MapInfoFloorComponent],
  exports: [MapInfoFloorComponent]
})
export class MapInfoFloorModule { }
