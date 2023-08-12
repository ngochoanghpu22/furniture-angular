import { CommonModule } from '@angular/common';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { TranslocoModule } from '@ngneat/transloco';
import { CustomAvatarModule } from '../avatar';
import { DirectivesModule } from '../directives';
import { LocationStatusModule } from '../location-status';
import { MapPinModule } from '../map-pin';
import { GoogleMapComponent } from './google-map.component';
import { MapInfoBuildingModule } from './map-info-building';
import { MapInfoFloorModule } from './map-info-floor';


@NgModule({
  imports: [
    CommonModule,
    GoogleMapsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    MapInfoBuildingModule,
    MapInfoFloorModule,
    CustomAvatarModule,
    DirectivesModule,
    LocationStatusModule,
    TranslocoModule,
    MapPinModule
  ],
  declarations: [GoogleMapComponent],
  exports: [GoogleMapComponent]
})
export class GoogleMapModule { }
