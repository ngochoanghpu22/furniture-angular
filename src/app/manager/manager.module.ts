import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CustomAvatarModule, TranslocoRootModule } from '@design-system/core';
import { ManagerAdminGuard, ManagerMapGuard, ManagerOfficeGuard, ManagerStatsGuard } from '@flex-team/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NotificationModule } from '../dashboard/components';
import { DesignSystemModule } from '../design-system';
import { ProfileModule } from '../profile/profile.module';
import {
  //AccordeonProfileComponent,
  ArchiveConfirmationModalComponent,
  CenterNotificationsComponent,
  ManagerPopoverMenuComponent,
  ManagerSidebarComponent
} from './components';
import { ManagerComponent } from './manager.component';
import { ManagerDashboardResolver } from './pages/manager-dashboard';
import { ManagerMapResolver } from './pages/manager-map/manager-map.resolver';
import { ManagerSettingsResolver } from './pages/manager-settings';


const routes: Routes = [
  {
    path: '', component: ManagerComponent,
    children: [
      {
        path: 'settings',
        loadChildren: () => import('./pages/manager-settings/manager-settings.module').then(m => m.ManagerSettingsModule)
      },
      {
        path: 'office',
        loadChildren: () => import('./pages/manager-office/manager-office.module').then(m => m.ManagerOfficeModule),
        canActivate: [ManagerOfficeGuard]
      },      
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/manager-dashboard/manager-dashboard.module')
          .then(m => m.ManagerDashboardModule)
      },
      {
        path: 'finishTask',
        loadChildren: () => import('./pages/finish-task/finish-task.module').then(m => m.FinishTaskModule)
      }, 
      {
        path: 'create-user',
        loadChildren: () => import('./pages/create-user/create-user.module').then(m => m.CreateUserModule),
        canActivate: [ManagerAdminGuard]
      },
      {
        path: 'edit-user/:id',
        loadChildren: () => import('./pages/create-user/create-user.module').then(m => m.CreateUserModule),
        canActivate: [ManagerAdminGuard]
      },
      {
        path: 'list-user',
        loadChildren: () => import('./pages/manager-user/manager-user.module').then(m => m.ManagerUserModule),
        canActivate: [ManagerAdminGuard]
      },
      {
        path: 'list-task',
        loadChildren: () => import('./pages/manager-task/manager-task.module').then(m => m.ManagerTaskModule)
      },
      {
        path: 'my-picked-task',
        loadChildren: () => import('./pages/my-task/my-task.module').then(m => m.MyTaskModule)
      },
      {
        path: 'my-own-task',
        loadChildren: () => import('./pages/my-task/my-task.module').then(m => m.MyTaskModule)
      },
      {
        path: 'users-picked-task/:id',
        loadChildren: () => import('./pages/users-picked-task/users-picked-task.module').then(m => m.UsersPickedTaskModule)
      },
      {
        path: 'add-task',
        loadChildren: () => import('./pages/task-detail/task-detail.module').then(m => m.TaskDetailModule),
        canActivate: [ManagerAdminGuard]
      },
      {
        path: 'detail-task/:id', 
        loadChildren: () => import('./pages/task-detail/task-detail.module').then(m => m.TaskDetailModule)
      },
      {
        path: 'edit-task/:id', 
        loadChildren: () => import('./pages/task-detail/task-detail.module').then(m => m.TaskDetailModule),
        canActivate: [ManagerAdminGuard]
      },
      {
        path: 'organization',
        loadChildren: () => import('./pages/manager-organization/manager-organization.module').then(m => m.ManagerOrganizationModule),
      },
      {
        path: 'directory',
        loadChildren: () => import('./pages/manager-directory/manager-directory.module').then(m => m.ManagerDirectoryModule),
      },
      {
        path: 'plan',
        loadChildren: () => import('./pages/manager-map/manager-map.module').then(m => m.ManagerMapModule),
        resolve: {
          buildings: ManagerMapResolver
        },
        canActivate: [ManagerMapGuard]
      },
      { path: '', pathMatch: 'full', redirectTo: 'calendar' }
    ]
  },
];

const components = [
  ManagerComponent,
  ManagerSidebarComponent,
  ManagerPopoverMenuComponent,
  CenterNotificationsComponent,
  ArchiveConfirmationModalComponent
];

const services = [
  ManagerDashboardResolver,
  ManagerSettingsResolver,
  ManagerMapResolver
]

@NgModule({
  imports: [
    //ProfileModule,
    CommonModule,
    DesignSystemModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslocoRootModule,
    CollapseModule,
    BsDropdownModule,
    NotificationModule,
    BsDatepickerModule,
    PopoverModule,
    NgxDatatableModule,
    CustomAvatarModule
  ],
  declarations: [
    ...components
  ],
  providers: [
    ...services
  ]
})
export class ManagerModule { }
