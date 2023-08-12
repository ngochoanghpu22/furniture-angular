import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
  CardOfficeModule,
  ChipModule,
  CustomAvatarModule,
  DirectivesModule, GoogleMapModule, LocationStatusModule, MapSeatModule,
  PlaceholderLoadingModule,
  SchedulerModule,
  SearchBarModule, SeatModule, SettingAddUserTeamModule, SpinnerModule, SwitchModule, TranslocoRootModule
} from '@design-system/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgSelectModule } from '@ng-select/ng-select';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import {
  AccordeonInOfficeComponent,
  CardBuildingComponent,
  CardFloorComponent,
  CardLocationComponent, CardMeetingRoomComponent,
  CardOfficeComponent, DetailContentComponent, DetailSeatsComponent,
  DetailSidebarComponent,
  ManagerMapDetailComponent,
  MapContentComponent,
  MapNoSeatComponent, MapSidebarComponent,
  MeetingSchedulerComponent,
  ModalMeetingDetailComponent,
  NavDateComponent,
  SearchUsersAutocompleteComponent
} from './components';
import { ManagerMapComponent } from './manager-map.component';

const routes: Routes = [
  {
    path: '',
    component: ManagerMapComponent
  },
  {
    path: ':id',
    component: ManagerMapDetailComponent
  }
];

const components = [
  ManagerMapComponent,
  DetailSidebarComponent,
  DetailContentComponent,
  CardFloorComponent,
  CardOfficeComponent,
  CardMeetingRoomComponent,
  DetailSeatsComponent,
  MapNoSeatComponent,
  NavDateComponent,
  CardLocationComponent,
  ManagerMapDetailComponent,
  MapContentComponent,
  MapSidebarComponent,
  AccordeonInOfficeComponent,
  CardBuildingComponent,
  ModalMeetingDetailComponent,
  SearchUsersAutocompleteComponent,
  MeetingSchedulerComponent
];

const services: any[] = []

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    DirectivesModule,
    TranslocoRootModule,
    PlaceholderLoadingModule,
    SearchBarModule,
    BsDatepickerModule,
    SeatModule,
    MapSeatModule,
    SettingAddUserTeamModule,
    CustomAvatarModule,
    SpinnerModule,
    TooltipModule,
    RouterModule.forChild(routes),
    CollapseModule,
    ChipModule,
    NgSelectModule,
    SchedulerModule,
    FullCalendarModule,
    CardOfficeModule,
    GoogleMapModule,
    LocationStatusModule,
    SwitchModule
  ],
  exports: [
    ...components
  ],
  declarations: [
    ...components
  ],
  providers: [
    ...services
  ]
})
export class ManagerMapModule { }
