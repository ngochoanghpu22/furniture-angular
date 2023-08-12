import { ChangeDetectorRef, Component, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'fxt-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  host: {
    'class': 'fxt-checkbox'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent implements ControlValueAccessor {

  private _onChange: any = () => { };
  private _onTouch: any = () => { }

  value: boolean;

  constructor(private cd: ChangeDetectorRef) { }

  writeValue(val: boolean): void {
    this.value = val;
    this.cd.detectChanges();
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouch = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
  }

  onModelChange(event: any) {
    this._onChange(event);
  }

  ngOnInit() {
  }

}
