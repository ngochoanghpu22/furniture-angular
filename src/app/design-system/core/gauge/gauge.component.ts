import { ChangeDetectionStrategy, Component, Input, OnInit, SimpleChanges } from '@angular/core';

const TranslateY_Default = 'translateY(0%)';

@Component({
  selector: 'fxt-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GaugeComponent implements OnInit {

  @Input() percentage: number = 0;
  @Input() isOutOfMonth: boolean = false;
  @Input() showGauge: boolean = true;

  circleStyle: string = '100%';
  transformY: string = TranslateY_Default;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {

    if (changes.percentage != null) {
      this.circleStyle = changes.percentage.currentValue + '%';
      this.transformY = `translateY(${100 - changes.percentage.currentValue}%)`;
    }

    if (changes.isOutOfMonth != null)
      if (changes.isOutOfMonth.currentValue) {
        this.circleStyle = '100%';
        this.transformY = TranslateY_Default;
      }
  }

}
