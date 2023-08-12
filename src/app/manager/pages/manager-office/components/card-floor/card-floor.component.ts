import {
  ChangeDetectionStrategy, Component,
  EventEmitter, Input, OnInit, Output
} from '@angular/core';
import { Floor } from '@flex-team/core';

@Component({
  selector: 'fxt-manager-office-card-floor',
  templateUrl: './card-floor.component.html',
  styleUrls: ['./card-floor.component.scss'],
  host: {
    class: 'fxt-manager-office-card-floor'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagerOfficeCardFloorComponent implements OnInit {

  @Input() floor: Floor;
  @Input() selected: boolean;

  @Output() select: EventEmitter<Floor> = new EventEmitter<Floor>();
  @Output() edit: EventEmitter<Floor> = new EventEmitter<Floor>();

  constructor() { }

  ngOnInit() {
  }

}
