import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslocoRootModule } from '@design-system/core';
import { NgChartsModule } from 'ng2-charts';
import { DesignSystemModule } from 'src/app/design-system';
import { StatsChartComponent } from './components';
import { ManagerStatsComponent } from './manager-stats.component';

const routes: Routes = [
  {
    path: '',
    component: ManagerStatsComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    TranslocoRootModule,
    NgChartsModule,
    RouterModule.forChild(routes),
    DesignSystemModule,
  ],
  declarations: [StatsChartComponent, ManagerStatsComponent],
})
export class ManagerStatsModule {}
