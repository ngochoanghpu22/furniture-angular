import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { AuthenticationService, ManagerCalendarService, ManagerSearchData, newGuid, SelectionItem, SelectionPayload, SelectionService, ValidEmailValidator } from "@flex-team/core";
import { BehaviorSubject, fromEvent, Observable, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { FxtAnimations } from "../animations";

@Component({
  selector: 'fxt-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  animations: [
    FxtAnimations.slideDown
  ]
})
export class SearchBarComponent implements OnInit, OnDestroy {

  @Input() tags: SelectionItem[] = [];
  @Input() disableQuickplayPicker = false;
  @Input() disableAllCompany = false;
  @Input() clearAfterSelect = false;

  @ViewChild('input', { static: true }) inputRef: ElementRef | null = null;

  @Output() selectionChanged: EventEmitter<SelectionItem[]> = new EventEmitter<SelectionItem[]>();
  @Output() tagsChanged: EventEmitter<SelectionItem[]> = new EventEmitter<SelectionItem[]>();

  showSuggestions: boolean = false;
  public currentSelection: SelectionPayload = { isAllCompany: false, isFavorites: false, items: [] };

  allCompanyChip = {
    id: "00000000-0000-0000-0000-000000000000",
    name: "All Company",
    teamName: "FlexTeam",
    image: "",
    selected: true,
    isPrefered: false,
    isHierarchy: false,
    isSocial: false,
    removable: true,
    group: 1,
    type: 0,
    isAllCompanyOrFavorites: true,
    isFavoritesGroups: false
  } as SelectionItem;

  data: ManagerSearchData = {
    teams: [],
    groups: [],
    users: []
  };

  loading: boolean = false;

  lastPattern: string;

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(private managerService: ManagerCalendarService,
    private selectionService: SelectionService,
    private authService: AuthenticationService,
    private cd: ChangeDetectorRef) { }

  ngOnInit() {

    this.getCurrentSelection();

    fromEvent(this.inputRef?.nativeElement, 'click')
      .pipe(takeUntil(this._destroyed)).subscribe(_ => {
        this.checkAndLaunchSearch();
      });

    fromEvent(this.inputRef?.nativeElement, 'keyup')
      .pipe(
        takeUntil(this._destroyed),
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(_ => {
        this.checkAndLaunchSearch();
      });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  addTag(item: SelectionItem) {
    if (this.clearAfterSelect) {
      this.tags = [];
    }

    if (!item.name) {
      item.name = item?.emails[0];
    }

    if (this.tags.findIndex(x => x.id === item.id) < 0) {
      this.tags.push(item);
      this.syncCurrentSelectionWithTags(item, true);
      this.notifyChanges();
      this.clearInput();
    }

  }

  removeTag(item: SelectionItem) {
    if (item.isAllCompanyOrFavorites) {
      this.getCurrentSelection();
    }
    const index = this.tags.findIndex(x => x.id === item.id);
    if (index >= 0 && !item.isAllCompanyOrFavorites) {
      this.tags.splice(index, 1);
      this.syncCurrentSelectionWithTags(item, false);
      this.notifyChanges();
    }
  }

  clearTags() {
    this.tags = [];
    this.notifyChanges();
  }

  onClickOutside() {
    this.showSuggestions = false;
  }

  clearInput() {
    if (this.inputRef) {
      this.inputRef.nativeElement.value = "";
      this.showSuggestions = false;
    }
  }

  trackByFn(index: number, item: any): string {
    return item.id;
  }

  onQuickPlayChanged() {
    this.getCurrentSelection(true);
  }

  chipCrossClicked(item: SelectionItem) {
    if (item.isAllCompanyOrFavorites || item.isFavoritesGroups) {
      this.tags = [];
    }
  }

  onChipClicked(item: SelectionItem) {
    if (item.selected)
      this.addTag(item);
    else
      this.removeTag(item);
  }

  toggleSelection(item: SelectionItem) {
    item.selected = !item.selected;
    if (item.selected) {
      this.addTag(item);
    } else {
      this.removeTag(item);
    }
  }

  addEmail(email: string = null) {
    if (this.data.users.length > 0) {
      return;
    }

    email = email.trim();

    if (ValidEmailValidator(email)) {
      const item = new SelectionItem();
      item.id = newGuid();
      item.emails = [email];
      item.name = email;
      item.isExternalEmail = true;
      item.type = 1;
      this.addTag(item);
    }
    else {
      this.clearInput();
    }
  }

  private syncCurrentSelectionWithTags(item: SelectionItem, selected: boolean) {
    const found = this.currentSelection.items.find(x => x.id == item.id);
    if (found) {
      found.selected = selected;
    }
  }


  private checkAndLaunchSearch() {
    const value = this.inputRef?.nativeElement.value.trim();
    this.showSuggestions = true;
    if (this.lastPattern != value) {
      this.launchSearch(value);
      this.lastPattern = value;
    }
    this.cd.detectChanges();
  }

  private launchSearch(searchTerm: string) {
    this.loading = true
    this.managerService.search(searchTerm).subscribe(data => {
      this.updateData(data.workload);
    }, _ => {
      this.updateData();
    })
  }

  private updateData(data?: ManagerSearchData) {
    this.data = data || new ManagerSearchData();
    this.loading = false;
    this.cd.detectChanges();
  }

  private notifyChanges() {
    this.selectionChanged.emit(this.tags);
  }

  private getCurrentSelection(doQuickPlayChanged?: boolean) {
    this.selectionService.getCurrentSelection()
      .subscribe(resp => {
        if (!resp.errorCode) {
          this.currentSelection = resp.workload;
          this.syncTagsWithCurrentSelection(resp.workload, doQuickPlayChanged);
          this.notifyChanges();
        }
        this.cd.detectChanges();
      });
  }

  private syncTagsWithCurrentSelection(payload: SelectionPayload, doQuickPlayChanged?: boolean) {

    payload.items.forEach(x => x.selected = false);

    let specialItem = null;

    if (payload.isAllCompany) {
      specialItem = SelectionItem.factoryAllCompanySelectionItem(this.authService.currentUser.companyName);
    }

    if (payload.isFavorites) {
      specialItem = SelectionItem.factoryFavoritesSelectionItem();
    }

    if (specialItem != null) {
      const hasAdreadyAllCompanyInTags = this.tags.findIndex(x => x.isAllCompanyOrFavorites) >= 0;
      specialItem.selected = doQuickPlayChanged || !hasAdreadyAllCompanyInTags;
      this.tags = [];
      if (specialItem.selected) {
        this.tags = [specialItem];
      }

      specialItem.removable = true;
      this.currentSelection.items = [specialItem];

    } else {

      this.tags = this.tags.filter(x => !x.isAllCompanyOrFavorites);

      for (let i = 0; i < payload.items.length; i++) {
        const item = payload.items[i];
        item.selected = false;
        const found = this.tags.find(x => x.id == item.id);
        if (found) {
          item.selected = true;
        }
      }
    }

  }

}
