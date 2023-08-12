import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyModule } from '@ngx-formly/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SortablejsModule } from 'ngx-sortablejs';
import { DesignSystemModule } from '../design-system';
import { AdminComponent } from './admin.component';
import {
  AddTeamMemberComponent, AdminSidebarComponent, AdminTableBuildingsComponent, AdminTableCompaniesComponent, AdminTableFloorsComponent, AdminTableJobLogsComponent,
  AdminTableOnboardingComponent,
  AdminTableTeamsComponent,
  AdminTableUsersComponent,
  FxtDatatableComponent
} from './components';
import {
  AdminCheckComponent, AdminCompanyComponent,
  AdminJobLogComponent, AdminOnboardingComponent,
  AdminSeatComponent,
  AdminTeamComponent, AdminTriggerComponent
} from './pages';
import { AdminTeamViewService } from './services';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'companies',
        component: AdminCompanyComponent,
      },
      {
        path: 'joblogs',
        component: AdminJobLogComponent,
      },
      {
        path: 'triggers',
        component: AdminTriggerComponent,
      },
      {
        path: 'check',
        component: AdminCheckComponent,
      },
      {
        path: 'onboardings',
        component: AdminOnboardingComponent,
      },
      {
        path: 'teams',
        component: AdminTeamComponent,
      },
      {
        path: 'seats',
        component: AdminSeatComponent,
      },
      { path: '', pathMatch: 'full', redirectTo: 'companies' },
    ],
  },
];

const components = [
  AdminComponent,
  AdminCompanyComponent,
  AdminTeamComponent,
  AdminSeatComponent,
  AdminSidebarComponent,
  AdminTableUsersComponent,
  AdminTableTeamsComponent,
  AdminTableBuildingsComponent,
  AdminTableFloorsComponent,
  AdminTableJobLogsComponent,
  FxtDatatableComponent,
  AdminTableCompaniesComponent,
  AdminJobLogComponent,
  AdminTableOnboardingComponent,
  AdminOnboardingComponent,
  AddTeamMemberComponent,
  AdminCheckComponent
];

const services = [AdminTeamViewService];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DesignSystemModule,
    NgxDatatableModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule,
    FormlyBootstrapModule,
    SortablejsModule,
    TooltipModule,
    DesignSystemModule
  ],
  declarations: [...components],
  providers: [...services],
})
export class AdminModule { }
