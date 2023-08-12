import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss'],
})
export class ToggleButtonComponent {
  public toggleState: boolean = true;
  @Output() changed = new EventEmitter<boolean>();
}
