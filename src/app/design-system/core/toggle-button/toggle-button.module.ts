import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ToggleButtonComponent } from './toggle-button.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ToggleButtonComponent],
  exports: [ToggleButtonComponent]
})
export class ToggleButtonModule { }
