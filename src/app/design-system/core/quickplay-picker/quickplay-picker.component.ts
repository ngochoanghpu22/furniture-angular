import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthenticationService, SelectionItem, SelectionPayload, SelectionService } from '@flex-team/core';
import { ModalService } from '../modal';
import { EditQuickDisplayComponent } from './edit-quick-display/edit-quick-display.component';

@Component({
  selector: 'fxt-quickplay-picker',
  templateUrl: './quickplay-picker.component.html',
  styleUrls: ['./quickplay-picker.component.scss']
})
export class QuickPlayPickerComponent implements OnInit {

  @Output() questionClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() changed: EventEmitter<any> = new EventEmitter<any>();

  @Output() chipClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() chipCrossClicked: EventEmitter<any> = new EventEmitter<any>();

  @Input() currentSelection: SelectionPayload;

  /** If true, the QuickPlay component will fill itself the current selection */
  @Input() isolated: boolean = true;

  constructor(private selectionService: SelectionService,
    private modalService: ModalService,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {
    if (this.isolated) {
      this.getCurrentSelection();
    }
  }


  getCurrentSelection() {
    this.selectionService.getCurrentSelection()
      .subscribe(resp => {
        if (!resp.errorCode) {
          this._treatSelectionPayload(resp.workload, true);
        }
      });
  }

  onChipClicked($event: Event, item: SelectionItem) {

    $event.preventDefault();
    $event.stopPropagation();

    if (!this.isolated) {
      item.selected = !item.selected;
      this.chipClicked.emit(item);
      return;
    }

    if (item.isAllCompanyOrFavorites) return;

    item.selected = !item.selected;

    this.selectionService.switchActivate(item)
      .subscribe(resp => {
        if (!resp.errorCode) {
          this._treatSelectionPayload(resp.workload, true);
        }
      });
  }


  onChipCrossClicked(item: SelectionItem) {

    this.chipCrossClicked.emit(item);

    this.selectionService.deleteFromSelection(item)
      .subscribe(resp => {
        if (!resp.errorCode) {
          this._treatSelectionPayload(resp.workload, true);
        }
      });
  }

  openModalEditQuickDisplay() {
    const modalRef = this.modalService.open(EditQuickDisplayComponent, {
      width: '80%',
      overflowYInitial: true
    });
    modalRef.afterClosed$.subscribe((resp: any) => {
      this.modalClosed(resp);
    })
  }

  modalClosed(resp: any) {
    if (this.isolated) {
      this.getCurrentSelection();
    }
    this._notifChanges();
  }

  private _treatSelectionPayload(payload: SelectionPayload, doNotif?: boolean) {
    let items = payload.items;
    if (payload.isAllCompany) {
      items = [SelectionItem.factoryAllCompanySelectionItem(this.authService.currentUser.companyName)];
    } else if (payload.isFavorites) {
      items = [SelectionItem.factoryFavoritesSelectionItem()];
    }
    this.currentSelection = payload;
    this.currentSelection.items = items;

    if (doNotif) {
      this._notifChanges();
    }

  }

  private _notifChanges() {
    this.changed.emit(this.currentSelection);
  }

}
