import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslocoRootModule } from '@design-system/core';
import { DesignSystemModule } from '../design-system';
import { PlanSelectDayComponent } from './plan-select-day.component';
import { PlanSelectDayModule } from './plan-select-day.module';

const routes: Routes = [
  {
    path: '',
    component: PlanSelectDayComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    DesignSystemModule,
    RouterModule.forChild(routes),
    TranslocoRootModule,
    PlanSelectDayModule
  ]
})
export class SelectedDayModule { }
