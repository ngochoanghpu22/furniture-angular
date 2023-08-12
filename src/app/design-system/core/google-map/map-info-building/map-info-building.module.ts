import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TranslocoRootModule } from '../../transloco';
import { MapInfoBlockUsersModule } from '../map-info-block-users';
import { MapInfoFloorModule } from '../map-info-floor';
import { MapInfoBuildingComponent } from './map-info-building.component';

@NgModule({
  imports: [
    CommonModule,
    TranslocoRootModule,
    CollapseModule,
    MapInfoFloorModule,
    MapInfoBlockUsersModule
  ],
  declarations: [MapInfoBuildingComponent],
  exports: [MapInfoBuildingComponent],
})
export class MapInfoBuildingModule { }
