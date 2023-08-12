import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaletteIconComponent } from './palette-icon.component';
import { TranslocoRootModule } from '../transloco';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslocoRootModule
  ],
  declarations: [PaletteIconComponent],
  exports: [PaletteIconComponent]
})
export class PaletteIconModule { }
