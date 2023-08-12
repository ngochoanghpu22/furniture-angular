import { CommonModule } from '@angular/common';
import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { TranslocoRootModule } from '../transloco';
import { GoogleMapSearchboxComponent } from './google-map-searchbox.component';
import { ModalSearchGooglemapLocationComponent } from './modal-search-googlemap-location/modal-search-googlemap-location.component';

@NgModule({
  imports: [
    CommonModule,
    GoogleMapsModule,
    HttpClientModule,
    HttpClientJsonpModule,
    TranslocoRootModule,
  ],
  declarations: [
    GoogleMapSearchboxComponent,
    ModalSearchGooglemapLocationComponent
  ],
  exports: [GoogleMapSearchboxComponent]
})
export class GoogleMapSearchboxModule { }
