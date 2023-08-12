import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'fxt-profile-block-info',
  templateUrl: './block-info.component.html',
  styleUrls: ['./block-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockInfoComponent implements OnInit {

  @Input() title: string = '';
  @Input() icon: string = 'fa-pen';
  @Input() showIcon: boolean | string = false;

  @Output() iconClicked: EventEmitter<void> = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  onClick() {
    if (this.showIcon) {
      this.iconClicked.emit();
    }
  }

}
