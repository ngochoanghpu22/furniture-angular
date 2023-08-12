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
import { TaskDetailComponent } from './task-detail.component';

import { CKEditorModule } from 'ckeditor4-angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { UserTaskService } from 'src/app/core/services/user-task-service/user-task-service';


const routes: Routes = [
  {
    path: '', 
    component: TaskDetailComponent,
  },
 
];

const components = [
    TaskDetailComponent,
];

const services: any[] = [
  UserTaskService
]

@NgModule({
  imports: [
    CKEditorModule,
    CommonModule,
    NgSelectModule,
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
export class TaskDetailModule { }
