import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChipModule, TranslocoRootModule } from '@design-system/core';
import { DesignSystemModule } from '../design-system';
import { PlanSelectDayComponent } from './plan-select-day.component';

@NgModule({
  imports: [
    CommonModule,
    DesignSystemModule,
    TranslocoRootModule,
    ChipModule,
    FormsModule
  ],
  declarations: [
    PlanSelectDayComponent
  ],
  exports: [
    PlanSelectDayComponent
  ]
})
export class PlanSelectDayModule { }
