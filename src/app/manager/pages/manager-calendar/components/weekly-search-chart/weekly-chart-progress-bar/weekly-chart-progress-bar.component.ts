import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'fxt-weekly-chart-progress-bar',
  templateUrl: './weekly-chart-progress-bar.component.html',
  styleUrls: ['./weekly-chart-progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagerWeeklyChartProgressBarComponent implements OnInit, OnChanges {

  @Input() name: string;
  @Input() value: number;
  @Input() statusOrderInList: number;
  @Input() statusColor: string;
  @Input() total: number = 1;

  @Input() currentSort: string;

  @Output() barClicked = new EventEmitter<void>();

  public _percent: number = 0;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.value || changes.total) {
      this._percent = Math.floor((this.value / this.total) * 100);
    }
  }

  onBarClicked() {
    this.barClicked.emit();
  }

}
