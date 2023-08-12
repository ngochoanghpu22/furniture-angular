import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
  CardOfficeModule, GoogleMapSearchboxModule,
  RadioGroupModule, SearchBarModule, TranslocoRootModule
} from '@design-system/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SortablejsModule } from 'ngx-sortablejs';
import { DesignSystemModule } from 'src/app/design-system';
import {
  ArchivedListComponent,
  FilePreviewInputComponent, FloorMapComponent, ManagerOfficeCardBuildingComponent,
  ManagerOfficeCardFloorComponent,
  ManagerOfficeModalAddBuildingComponent, ManagerOfficeModalAddFloorComponent,
  ManagerOfficeModalAddZoneComponent, ManagerOfficeModalDetailOfficeComponent,
  ManagerOfficeModalEditOfficeComponent, ManagerOfficeRowPresenceUserComponent,
  ModalAddOccupationRuleComponent, ModalAddSeatComponent, ModalDetailsBuildingComponent,
  ModalListExternalOfficeComponent,
  OccupationRuleComponent
} from './components';
import { ManagerOfficeComponent } from './manager-office.component';
import { ManagerOfficeViewService } from './services';

const routes: Routes = [
  {
    path: '',
    component: ManagerOfficeComponent
  }
];

const services = [
  ManagerOfficeViewService
]

const components = [
  ManagerOfficeCardBuildingComponent,
  ManagerOfficeCardFloorComponent,
  FilePreviewInputComponent,
  ManagerOfficeModalAddBuildingComponent,
  ManagerOfficeModalAddFloorComponent,
  ManagerOfficeModalAddZoneComponent,
  ManagerOfficeModalEditOfficeComponent,
  ManagerOfficeModalDetailOfficeComponent,
  ModalListExternalOfficeComponent,
  ModalDetailsBuildingComponent,
  ManagerOfficeComponent,
  ManagerOfficeRowPresenceUserComponent,
  ArchivedListComponent,
  OccupationRuleComponent,
  ModalAddOccupationRuleComponent,
  ModalAddSeatComponent,
  FloorMapComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslocoRootModule,
    DesignSystemModule,
    SortablejsModule,
    BsDatepickerModule,
    BsDropdownModule,
    CardOfficeModule,
    GoogleMapSearchboxModule,
    TooltipModule,
    NgxDatatableModule,
    CollapseModule,
    RadioGroupModule,
    PopoverModule,
    SearchBarModule,
    PopoverModule,
    NgSelectModule
  ],
  providers: [
    ...services
  ],
  declarations: [
    ...components
  ]
})
export class ManagerOfficeModule { }
