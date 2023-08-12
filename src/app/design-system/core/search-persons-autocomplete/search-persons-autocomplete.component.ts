import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationService, SelectionGroups, SelectionItem, SelectionPayload } from '@flex-team/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { forkJoin } from 'rxjs';
import { QuickPlayDataProvider } from './quickplay-data.provider';

@Component({
  selector: 'fxt-search-persons-autocomplete',
  templateUrl: './search-persons-autocomplete.component.html',
  styleUrls: ['./search-persons-autocomplete.component.scss'],
  host: {
    'class': 'fxt-search-persons-autocomplete'
  }
})
export class SearchPersonsAutocompleteComponent implements OnInit, OnChanges {

  @ViewChild(NgSelectComponent) ngSelectCmp: NgSelectComponent;

  @Output() selected: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleted: EventEmitter<any> = new EventEmitter<any>();

  @Input() selections: any[] = [];
  @Input() hideSuggestionsOnLoad: boolean;
  @Input() disableAllCompany: boolean;
  @Input() disableFavorites: boolean;

  @Input() set currentSelection(payload: SelectionPayload) {
    if (payload) {
      this._treatSelectionPayload(payload);
    }
  };

  public chips: SelectionItem[] = [];

  SelectGroupTypesEnum = SelectionGroups;

  defaultItems: any[] = [];
  allItems: any[] = [];
  favorites: any[] = [];

  items: any[] = [];

  constructor(
    private quickPlayDataProvider: QuickPlayDataProvider,
    private authService: AuthenticationService,
    private cd: ChangeDetectorRef) {
    if (this.quickPlayDataProvider == null) {
      throw new Error("QuickPlayDataProvider not found");
    }
  }

  ngOnInit() {
    if (!this.hideSuggestionsOnLoad) {
      this.initDefaultItems();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selections) {
      this.allItems = this.factoryAllItems();
    }
  }

  onChange($event: any) {
    if ($event && $event.id) {
      this.selected.emit($event);
      this.ngSelectCmp.handleClearClick();
    }
  }

  onSearch(searchTerm: string) {
    if (searchTerm) {
      searchTerm = searchTerm.toLowerCase();
      this.items = this.allItems.filter(x => {
        const emails: string = x.emails.join('').toLowerCase();
        const text = `${x.name || ''}${x.fullName || ''}${x.teamName || ''}${emails}`;
        if (text.toLowerCase().includes(searchTerm)) return true;
        return false;
      });
    } else {
      this.items = this.defaultItems;
    }

    this.items = this.items.map(i => {
      i.name = i.name || i.emails.join('');
      i.selected = this.chips.findIndex(c => c.id === i.id) > -1;
      return i;
    });

  }

  private _treatSelectionPayload(payload: SelectionPayload) {
    if (payload.isAllCompany) {
      this.chips = [SelectionItem.factoryAllCompanySelectionItem(this.authService.currentUser?.companyName)];
    } else if (payload.isFavorites) {
      this.chips = [SelectionItem.factoryFavoritesSelectionItem()];
    } else {
      this.chips = payload.items;
    }
    this.items = this.items.map(i => {
      const selected = this.chips.findIndex(c => c.id === i.id) > -1;
      return { ...i, selected };
    });
  }

  private initDefaultItems() {
    const obj$ = [
      this.quickPlayDataProvider.getFavoritesSelection(),
      this.quickPlayDataProvider.getDefaultGroupsSelection()
    ];

    forkJoin(obj$).subscribe(([favoritesArr, groupsArr]) => {

      this.favorites = favoritesArr;

      const favorites = favoritesArr.map(y => Object.assign({}, y, {
        team: 'Colleague list',
        group: SelectionGroups.FavoritesGroups,
        selected: true
      }));

      const groups: any[] = groupsArr.map(y => Object.assign({}, y, {
        team: y.name,
        group: SelectionGroups.Groups,
        selected: true
      }));

      this.defaultItems = [
        SelectionItem.factoryAllCompanySelectionItem(this.authService.currentUser.companyName),
        ...favorites,
        ...groups];

      this.items = this.defaultItems.map(di => {
        const selected = this.chips.findIndex(c => c.id === di.id) > -1;
        return { ...di, selected };
      });
    })
  }


  private factoryAllItems(): any[] {
    return this.selections.map(x => Object.assign({}, x, {
      group: null
    }));
  }

}
