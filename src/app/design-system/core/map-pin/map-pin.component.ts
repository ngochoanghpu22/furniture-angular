import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit } from '@angular/core';
import { MapPin } from '@flex-team/core';

@Component({
  selector: 'fxt-map-pin',
  templateUrl: './map-pin.component.html',
  styleUrls: ['./map-pin.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapPinComponent implements OnInit {

  @Input() pin: MapPin;

  text: string;

  constructor(private _elementRef: ElementRef) {
  }

  ngOnInit() {
    this.text = `${this.pin.address}, ${this.pin.postalCode} ${this.pin.city}`;
    const supports = 'loading' in HTMLImageElement.prototype;
    if (supports) {
      const imageRef = this._elementRef.nativeElement.querySelector('.map-pin-image');
      if (imageRef) {
        imageRef.setAttribute('loading', 'lazy');
      }
    }
  }

}
