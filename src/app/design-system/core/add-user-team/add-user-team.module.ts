import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoRootModule } from '../transloco';
import { CustomAvatarModule } from '../avatar';
import { SettingAddUserTeamComponent } from './add-user-team.component';

@NgModule({
  declarations: [
    SettingAddUserTeamComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslocoRootModule,
    CustomAvatarModule
  ],
  exports: [SettingAddUserTeamComponent]
})
export class SettingAddUserTeamModule { }
