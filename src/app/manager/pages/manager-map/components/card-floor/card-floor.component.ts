import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'fxt-manager-map-card-floor',
  templateUrl: './card-floor.component.html',
  styleUrls: ['./card-floor.component.scss'],
  host: {
    "(click)": "onClick($event)"
  }
})
export class CardFloorComponent implements OnInit {

  @Input() floor: any;
  @Input() selectedDate: Date;

  @HostBinding('class.selected') @Input() selected: boolean;

  @Output() clicked: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  onClick(event: any) {
    event.preventDefault();
    this.clicked.emit(this.floor.id);
  }

}
