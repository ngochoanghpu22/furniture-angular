import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AvatarModule } from 'ngx-avatar';
import { ChipComponent } from './chip.component';

@NgModule({
  imports: [
    CommonModule,
    AvatarModule
  ],
  declarations: [ChipComponent],
  exports: [ChipComponent]
})
export class ChipModule { }
