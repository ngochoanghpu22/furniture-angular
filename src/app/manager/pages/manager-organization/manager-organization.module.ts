import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { GoogleMapSearchboxModule, LocationStatusModule, PaletteIconModule, TranslocoRootModule } from '@design-system/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SortablejsModule } from 'ngx-sortablejs';
import { DesignSystemModule } from 'src/app/design-system';
import {
  CompanyInfoComponent,
  CompanyOptionComponent,
  ManagerBillingComponent,
  ManagerIntegrationComponent,
  WorkingPolicyComponent,
  WorkingPolicyModalComponent
} from './components';
import { ManagerOrganizationModalAddWorkingStatusComponent } from './components/modals';
import { ManagerOrganizationComponent } from './manager-organization.component';
import { ManagerOrganizationViewService } from './services';
import { TimeslotTemplateComponent } from './components/timeslot-template/timeslot-template.component';
import { TimeslotTemplateModalComponent } from './components/timeslot-template-modal/timeslot-template-modal.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FullCalendarModule } from '@fullcalendar/angular';

const services = [
  ManagerOrganizationViewService
]

const routes: Routes = [
  {
    path: '',
    component: ManagerOrganizationComponent,
    children: [
      {
        path: 'company-info',
        component: CompanyInfoComponent
      },
      {
        path: 'working-policy',
        component: WorkingPolicyComponent
      },
      {
        path: 'timeslot-template',
        component: TimeslotTemplateComponent
      },
      {
        path: 'billing',
        component: ManagerBillingComponent
      },
      {
        path: 'integrations',
        component: ManagerIntegrationComponent
      },
      {
        path: 'company-option',
        component: CompanyOptionComponent
      },
      { path: '', pathMatch: 'full', redirectTo: 'company-info' }
    ]
  },
];

const components = [
  ManagerOrganizationComponent,
  CompanyInfoComponent,
  ManagerBillingComponent,
  ManagerIntegrationComponent,
  WorkingPolicyComponent,
  WorkingPolicyModalComponent,
  ManagerOrganizationModalAddWorkingStatusComponent,
  CompanyOptionComponent
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    GoogleMapSearchboxModule,
    NgSelectModule,
    TranslocoRootModule,
    FormsModule,
    ReactiveFormsModule,
    DesignSystemModule,
    SortablejsModule,
    PaletteIconModule,
    PopoverModule,
    TooltipModule,
    NgSelectModule,
    NgxDatatableModule,
    FullCalendarModule,
    LocationStatusModule
  ],
  providers: [
    ...services
  ],
  declarations: [...components, TimeslotTemplateComponent, TimeslotTemplateModalComponent]
})
export class ManagerOrganizationModule { }
