import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoRootModule } from '../transloco';
import { MapPinComponent } from './map-pin.component';

@NgModule({
  declarations: [MapPinComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslocoRootModule
  ],
  exports: [MapPinComponent],
})
export class MapPinModule { }
