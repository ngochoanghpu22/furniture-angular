import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AvailableColors, AvailableIcons } from '@flex-team/core';

@Component({
  selector: 'fxt-palette-icon',
  templateUrl: './palette-icon.component.html',
  styleUrls: ['./palette-icon.component.scss']
})
export class PaletteIconComponent implements OnInit {

  @Output() selected = new EventEmitter<any>();

  @Input() color: string;
  @Input() icon: string;
  @Input() searchable = false;

  searchTerm: string;

  availableIcons: string[] = AvailableIcons;
  availableColors: string[] = AvailableColors;

  filteredIcons: string[];

  constructor() {
    this.filteredIcons = this.availableIcons;
  }

  ngOnInit() {
  }

  onChange(term: string) {
    this.filteredIcons = this.availableIcons.filter(x => x.indexOf(term) >= 0);
  }

  changeIcon(item: string) {
    this.icon = item;
    this.notifyChanges(item, this.color);
  }

  changeColor(color: string) {
    this.color = color;
    this.notifyChanges(this.icon, this.color)
  }

  private notifyChanges(item: string, color: string) {
    this.selected.emit({
      icon: item,
      color: color,
    });
  }

}
