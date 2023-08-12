import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { LocationStatusModule, SearchBarModule, TranslocoRootModule } from '@design-system/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SortablejsModule } from 'ngx-sortablejs';
import { DesignSystemModule } from 'src/app/design-system';
import { IsPastDatePipe } from 'src/app/manager/pipes';
import {
  ManagerBlockDevelopersComponent, ManagerBlockFiltersComponent,
  ManagerBlockToggleComponent, ManagerCardUserComponent,
  ManagerUserRowComponent, ManagerWeeklyChartProgressBarComponent,
  ManagerWeeklySearchChartComponent, ManagerWeeklySearchSummaryComponent
} from './components';
import { ManagerCalendarComponent } from './manager-calendar.component';
import { ManagerCalendarFilterService } from './services';

const routes: Routes = [
  {
    path: '',
    component: ManagerCalendarComponent
  }
];

const services = [
  ManagerCalendarFilterService
]

const components = [
  ManagerCalendarComponent,
  ManagerBlockDevelopersComponent,
  ManagerBlockFiltersComponent,
  ManagerBlockToggleComponent,
  ManagerCardUserComponent,
  ManagerUserRowComponent,
  ManagerWeeklySearchChartComponent,
  ManagerWeeklySearchSummaryComponent,
  ManagerWeeklyChartProgressBarComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslocoRootModule,
    DesignSystemModule,
    SortablejsModule,
    SearchBarModule,
    PopoverModule,
    TooltipModule,
    LocationStatusModule
  ],
  providers: [
    ...services
  ],
  declarations: [
    ...components,
    IsPastDatePipe
  ]
})
export class ManagerCalendarModule { }
