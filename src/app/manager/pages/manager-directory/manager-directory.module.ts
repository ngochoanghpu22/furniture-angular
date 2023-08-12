import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChipModule, CustomAvatarModule, SearchBarModule, TranslocoRootModule } from '@design-system/core';
import { ManagerDirectoryGuard } from '@flex-team/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DesignSystemModule } from 'src/app/design-system';
import {
  ArchivedUsersComponent, CurrentUsersComponent,
  DropdownInviteUserComponent, PendingInvitationComponent, UserProvisionedComponent
} from './components';
import { ManagerDirectoryComponent } from './manager-directory.component';


const routes: Routes = [
  {
    path: '',
    component: ManagerDirectoryComponent,
    children: [
      {
        path: 'current-users',
        component: CurrentUsersComponent,
      },
      {
        path: 'pending-invitation',
        component: PendingInvitationComponent,
        canActivate: [ManagerDirectoryGuard]
      },
      {
        path: 'archived-users',
        component: ArchivedUsersComponent,
        canActivate: [ManagerDirectoryGuard]
      },
      {
        path: 'user-provisioned',
        component: UserProvisionedComponent,
        canActivate: [ManagerDirectoryGuard]
      },
      { path: '', pathMatch: 'full', redirectTo: 'current-users' }
    ]
  },
];

const components = [
  CurrentUsersComponent,
  PendingInvitationComponent,
  ArchivedUsersComponent,
  UserProvisionedComponent,
  DropdownInviteUserComponent
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslocoRootModule,
    SearchBarModule,
    NgxDatatableModule,
    CustomAvatarModule,
    ChipModule,
    TooltipModule,
    BsDropdownModule,
    DesignSystemModule
  ],
  declarations: [
    ManagerDirectoryComponent,
    ...components
  ]
})
export class ManagerDirectoryModule { }
