import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslocoRootModule } from '@design-system/core';
import { PlanSelectDayModule } from 'src/app/plan-select-day';
import { ManagerDashboardComponent } from './manager-dashboard.component';
import { ManagerDashboardResolver } from './manager-dashboard.resolver';

const routes: Routes = [
  {
    path: '',
    component: ManagerDashboardComponent,
    // resolve: {
    //   isOk: ManagerDashboardResolver
    // },
    data: {
      modeManager: true
    }
  }
];

@NgModule({
  imports: [
    CommonModule,
    PlanSelectDayModule,
    TranslocoRootModule,
    RouterModule.forChild(routes),
  ],
  declarations: [ManagerDashboardComponent]
})
export class ManagerDashboardModule { }
