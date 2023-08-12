import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { RowPreferedWeekModule, SettingAddUserTeamModule, TranslocoRootModule } from '@design-system/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DesignSystemModule } from '../design-system';
import {
  AccordeonProfileComponent,
  BlockInfoComponent,
  CardStatProfileComponent,
  MyRemoteProfilComponent,
  OtherInfoComponent
} from './components';
import { ProfileComponent } from './profile.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileComponent
  }
];

const components = [
  ProfileComponent,
  AccordeonProfileComponent,
  CardStatProfileComponent,
  MyRemoteProfilComponent,
  OtherInfoComponent,
  BlockInfoComponent,
]

@NgModule({
  imports: [
    CommonModule,
    DesignSystemModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslocoRootModule,
    BsDropdownModule,
    NgSelectModule,
    CollapseModule,
    TooltipModule,
    SettingAddUserTeamModule,
    RowPreferedWeekModule
  ],
  declarations: [
    ...components,
  ]
})
export class ProfileModule { }
