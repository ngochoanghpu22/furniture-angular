import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GoogleMapModule, TranslocoRootModule } from '@design-system/core';
import { ModalGoogleMapComponent } from './modal-google-map.component';

@NgModule({
  imports: [
    CommonModule,
    TranslocoRootModule,
    GoogleMapModule
  ],
  declarations: [
    ModalGoogleMapComponent
  ],
  exports: [
    ModalGoogleMapComponent
  ],
})
export class ModalGoogleMapModule { }
