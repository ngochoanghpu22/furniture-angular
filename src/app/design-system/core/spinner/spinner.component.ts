import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'fxt-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {

  /**
   * What color to display
  */
  @Input()
  @HostBinding('attr.color')
  color: string = 'primary';
}
