import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  CalendarModule, ChipModule, CircleDayModule, CustomAvatarModule,
  DirectivesModule, LocationPanelModule, RowPreferedWeekModule,
  SettingAddUserTeamModule, TranslocoRootModule
} from '@design-system/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TaskService } from 'src/app/core/services/task-service/task.service';
import { UserService } from 'src/app/core/services/user-service/user.service';
import { SwiperModule } from 'swiper/angular';
import { ModalUserProfileComponent } from './modal-user-profile.component';
import { UserMyFavoritesComponent } from './user-my-favorites/user-my-favorites.component';
import { UserPersonalInfosComponent } from './user-personal-infos/user-personal-infos.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { UserScheduleComponent } from './user-schedule/user-schedule.component';
import { UserWorkDetailsComponent } from './user-work-details/user-work-details.component';

const services = [UserService, TaskService];

@NgModule({
  imports: [
    CommonModule,
    TranslocoRootModule,
    ChipModule, CalendarModule,
    SwiperModule, CircleDayModule, DirectivesModule,
    PopoverModule, CustomAvatarModule,
    TooltipModule, BsDropdownModule,
    NgSelectModule,
    FormsModule,
    CollapseModule,
    SettingAddUserTeamModule,
    RowPreferedWeekModule,
    LocationPanelModule,
    ReactiveFormsModule
  ],
  declarations: [
    ModalUserProfileComponent,
    UserScheduleComponent,
    UserWorkDetailsComponent,
    UserPersonalInfosComponent,
    UserMyFavoritesComponent,
    UserPreferencesComponent
  ],
  providers: [...services],
  exports: [ModalUserProfileComponent],
})
export class ModalUserProfileModule { }
