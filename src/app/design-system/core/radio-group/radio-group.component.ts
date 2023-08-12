import { ChangeDetectorRef, Component, forwardRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { NameValuePair } from '@flex-team/core';

@Component({
  selector: 'fxt-radio-group',
  templateUrl: './radio-group.component.html',
  host: {
    class: 'fxt-radio-group'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true
    }
  ]
})
export class RadioGroupComponent implements OnInit, ControlValueAccessor {

  @Input() options: NameValuePair[] = [];

  value: any;

  private _onChange: any = () => { };
  private _onTouch: any = () => { }

  constructor(private cd: ChangeDetectorRef) { }

  writeValue(val: any): void {
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

  ngOnInit() {
  }

  onChange(val: any) {
    this._onChange(val);
  }

}
