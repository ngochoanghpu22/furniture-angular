import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CustomAvatarModule, TranslocoRootModule } from '@design-system/core';
import { ManagerMapGuard, ManagerOfficeGuard, ManagerStatsGuard } from '@flex-team/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { DesignSystemModule } from 'src/app/design-system';
import { ManagerUserComponent } from './manager-user.component';

const routes: Routes = [
  {
    path: '', 
    component: ManagerUserComponent,
  },
 
];

const components = [
    ManagerUserComponent,
];

const services: any[] = [
]

@NgModule({
  imports: [
    CommonModule,
    DesignSystemModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslocoRootModule,
    CollapseModule,
    BsDropdownModule,
    BsDatepickerModule,
    NgxDatatableModule,
    PopoverModule,
    CustomAvatarModule
  ],
  declarations: [
    ...components,
  ],
  providers: [
    ...services
  ]
})
export class ManagerUserModule { }
