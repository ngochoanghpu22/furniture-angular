import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import {
  BlocChipsPersonModule,
  CalendarModule,
  CheckboxModule,
  ChipModule, CircleDayModule,
  CustomAvatarModule,
  DirectivesModule,
  DndMapSeatsModule,
  DropdownModule,
  GaugeModule,
  LocationPanelModule,
  LocationSelectorModule, MapSeatModule,
  MeetingRoomModule, ModalMetadataModule, ModalModule,
  PlaceholderLoadingModule, QuickPlayPickerModule, SchedulerModule,
  SearchPersonsAutocompleteModule,
  SeatModule, SettingAddUserTeamModule, SpinnerModule, SwitchModule, ToggleButtonModule
} from './core';

const modules = [
  TooltipModule,
  ChipModule,
  GaugeModule,
  CircleDayModule,
  ToggleButtonModule,
  DropdownModule,
  LocationSelectorModule,
  ModalModule,
  SpinnerModule,
  CalendarModule,
  DirectivesModule,
  SearchPersonsAutocompleteModule,
  BlocChipsPersonModule,
  LocationPanelModule,
  PlaceholderLoadingModule,
  QuickPlayPickerModule,
  SeatModule,
  MeetingRoomModule,
  CustomAvatarModule,
  CheckboxModule,
  MapSeatModule,
  SwitchModule,
  SchedulerModule,
  SettingAddUserTeamModule,
  ModalMetadataModule,
  DndMapSeatsModule
]

@NgModule({
  imports: [
    CommonModule,
    ...modules
  ],
  declarations: [],
  exports: [
    ...modules
  ]
})
export class DesignSystemModule { }
