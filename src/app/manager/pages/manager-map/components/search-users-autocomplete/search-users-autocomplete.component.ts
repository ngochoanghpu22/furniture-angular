import {
  ChangeDetectionStrategy, Component, EventEmitter,
  Input, OnInit, Output, ViewChild
} from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'fxt-search-users-autocomplete',
  templateUrl: './search-users-autocomplete.component.html',
  styleUrls: ['./search-users-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchUsersAutocompleteComponent implements OnInit {

  @ViewChild(NgSelectComponent) ngSelectCmp: NgSelectComponent;

  @Input() items: any[] = [];

  @Output() selected = new EventEmitter<any>();

  filteredItems: any[] = [];

  constructor() { }

  ngOnInit() {
  }

  onChange($event: any) {
    if ($event && $event.id) {
      this.selected.emit($event);
      this.ngSelectCmp.handleClearClick();
      this.filteredItems = [];
    }
  }

  onSearch(searchTerm: string) {
    if (searchTerm) {
      searchTerm = searchTerm.toLowerCase();
      this.filteredItems = this.items.filter(x => (x.email && x.email.toLowerCase().indexOf(searchTerm) != -1) ||  (x.name && x.name.toLowerCase().indexOf(searchTerm) != -1));
    } 
    else 
    {
      this.filteredItems = this.items;
    }
  }
}
