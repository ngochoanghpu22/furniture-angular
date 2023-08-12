import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Office, OfficeType, Seat } from '@flex-team/core';

@Component({
  selector: 'fxt-card-office',
  templateUrl: './card-office.component.html',
  styleUrls: ['./card-office.component.scss'],
  host: {
    class: 'fxt-card-office'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardOfficeComponent implements OnInit {

  @Input() office: Office;
  @Input() selected: boolean;
  @Input() canEdit = true;
  @Input() modeDesk = false;

  @Output() select: EventEmitter<string> = new EventEmitter<string>();
  @Output() addSeatClicked: EventEmitter<Office> = new EventEmitter<Office>();
  @Output() seatHovered: EventEmitter<Seat[]> = new EventEmitter<Seat[]>();
  @Output() seatClicked: EventEmitter<Seat> = new EventEmitter<Seat>();
  @Output() archive: EventEmitter<Office> = new EventEmitter<Office>();
  @Output() edit: EventEmitter<Office> = new EventEmitter<Office>();

  OfficeTypeEnum = OfficeType;
  showListSeats = false;

  constructor() { }

  ngOnInit() {
  }

  onCardClicked($event: any) {
    if (this.modeDesk) {
      $event.preventDefault();
      $event.stopPropagation();
      this.showListSeats = !this.showListSeats;
      const hoveredSeats = this.showListSeats ? [...this.office.seats] : [];
      this.seatHovered.emit(hoveredSeats);
    } else {
      this.select.emit(this.office.id);
    }
  }

  toggleSeats() {
    this.showListSeats = !this.showListSeats;
  }

  onAddSeatClicked($event: any) {
    $event.preventDefault();
    $event.stopPropagation();
    this.addSeatClicked.emit(this.office);
  }

}
