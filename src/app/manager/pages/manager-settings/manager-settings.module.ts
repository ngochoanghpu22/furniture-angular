import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TranslocoRootModule } from '@design-system/core';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DesignSystemModule } from 'src/app/design-system';
import { SettingCardUserComponent } from './components/card-user/card-user.component';
import { SettingsComponent } from './manager-settings.component';

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent
  }
];

const components = [
  SettingsComponent,
  SettingCardUserComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TranslocoRootModule,
    DesignSystemModule,
    TooltipModule,
    CollapseModule,
  ],
  declarations: [
    ...components
  ]
})
export class ManagerSettingsModule { }
