import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChipModule } from '../chip';
import { BlocChipsPersonComponent } from './bloc-chips-person.component';

@NgModule({
  imports: [
    CommonModule,
    ChipModule
  ],
  declarations: [BlocChipsPersonComponent],
  exports: [BlocChipsPersonComponent]
})
export class BlocChipsPersonModule { }
