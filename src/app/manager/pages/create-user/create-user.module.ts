import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CustomAvatarModule, TranslocoRootModule } from '@design-system/core';
import { ManagerMapGuard, ManagerOfficeGuard, ManagerStatsGuard } from '@flex-team/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { DesignSystemModule } from 'src/app/design-system';
import { CreateUserComponent } from './create-user.component';


const routes: Routes = [
  {
    path: '', 
    component: CreateUserComponent,
  },
 
];

const components = [
    CreateUserComponent,
];

const services: any[] = [
]

@NgModule({
  imports: [
    CommonModule,
    DesignSystemModule,
    NgSelectModule,
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
export class CreateUserModule { }
