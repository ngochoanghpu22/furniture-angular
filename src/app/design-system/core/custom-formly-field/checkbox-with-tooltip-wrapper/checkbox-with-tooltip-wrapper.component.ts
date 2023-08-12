import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'fxt-checkbox-with-tooltip-wrapper',
  templateUrl: './checkbox-with-tooltip-wrapper.component.html',
  styleUrls: ['./checkbox-with-tooltip-wrapper.component.scss'],
})
export class CheckboxWithTooltipWrapper extends FieldWrapper {

  constructor() {
    super();
  }

  ngOnInit() {
  }

}
