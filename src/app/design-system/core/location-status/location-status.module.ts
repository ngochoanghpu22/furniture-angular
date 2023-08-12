import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationStatusComponent } from './location-status.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@NgModule({
  imports: [
    CommonModule,
    TooltipModule
  ],
  declarations: [LocationStatusComponent],
  exports: [LocationStatusComponent],
})
export class LocationStatusModule { }
