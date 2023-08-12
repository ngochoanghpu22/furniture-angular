import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AvatarModule } from 'ngx-avatar';
import { DirectivesModule } from '../directives';
import { AvatarComponent } from './avatar.component';

@NgModule({
  imports: [
    CommonModule,
    AvatarModule,
    DirectivesModule
  ],
  declarations: [AvatarComponent],
  exports: [AvatarComponent]
})
export class CustomAvatarModule { }
