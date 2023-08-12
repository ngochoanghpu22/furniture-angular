import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CustomAvatarModule } from '../avatar';
import { ChipModule } from '../chip';
import { DirectivesModule } from '../directives';
import { LocationStatusModule } from '../location-status';
import { SwitchModule } from '../switch';
import { TranslocoRootModule } from '../transloco';
import { SeatComponent } from './seat.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CustomAvatarModule,
    PopoverModule,
    TranslocoRootModule,
    DirectivesModule,
    ChipModule,
    TooltipModule,
    SwitchModule,
    LocationStatusModule
  ],
  declarations: [SeatComponent],
  exports: [SeatComponent]
})
export class SeatModule { }
