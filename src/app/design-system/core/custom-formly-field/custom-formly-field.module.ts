import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CheckboxWithTooltipWrapper } from './checkbox-with-tooltip-wrapper/checkbox-with-tooltip-wrapper.component';
import { CustomMulticheckboxWithTooltipWrapper } from './custom-multicheckbox-with-tooltip-wrapper/custom-multicheckbox-with-tooltip-wrapper.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule
  ],
  declarations: [CheckboxWithTooltipWrapper, CustomMulticheckboxWithTooltipWrapper],
  exports: [
    CheckboxWithTooltipWrapper,
    CustomMulticheckboxWithTooltipWrapper
  ]
})
export class CustomFormlyFieldModule { }
