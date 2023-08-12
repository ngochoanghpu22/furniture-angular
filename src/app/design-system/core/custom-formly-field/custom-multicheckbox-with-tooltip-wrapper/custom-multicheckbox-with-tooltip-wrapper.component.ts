import { Component } from '@angular/core';
import { FieldWrapper } from '@ngx-formly/core';

@Component({
  selector: 'fxt-custom-multicheckbox-with-tooltip-wrapper',
  templateUrl: './custom-multicheckbox-with-tooltip-wrapper.component.html',
  styleUrls: ['./custom-multicheckbox-with-tooltip-wrapper.component.scss'],
})
export class CustomMulticheckboxWithTooltipWrapper extends FieldWrapper {

  constructor() {
    super();
  }

  ngOnInit() {
  }

}
