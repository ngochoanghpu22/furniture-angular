import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SelectionItem, SelectionPayload, SelectionService } from '@flex-team/core';
import { ModalRef } from '../../modal';

@Component({
  selector: 'fxt-edit-quick-display',
  templateUrl: './edit-quick-display.component.html',
  styleUrls: ['./edit-quick-display.component.scss']
})
export class EditQuickDisplayComponent implements OnInit {

  public possibleSelection: SelectionItem[] = [];
  public currentSelection: SelectionPayload;

  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();

  public selections: SelectionItem[] = [];
  public nbUser: number = 0;

  constructor(private selectionService: SelectionService,
    private modalRef: ModalRef,
    private router: Router) {
  }

  navigateBack() {
    this.router.navigate(['/plan']);
  }

  ngOnInit(): void {
    this.getPossibleSelection();
    this.getCurrentSelection();
  }

  selectEvent(item: SelectionItem) {
    this.addToSelection(item);
  }

  addToSelection(item: SelectionItem) {
    this.selectionService.addToSelection(item)
      .subscribe(resp => {
        if (!resp.errorCode) {
          this._treatSelectionPayload(resp.workload);
          if (item.isAllCompanyOrFavorites) {
            this.confirm(true);
          }
        }
      });
  }

  deleteFromList(item: SelectionItem) {
    this.selectionService.deleteFromSelection(item)
      .subscribe(resp => {
        if (!resp.errorCode) {
          this._treatSelectionPayload(resp.workload);
        }
      });
  }

  getCurrentSelection() {
    this.selectionService.getCurrentSelection()
      .subscribe(resp => {
        if (!resp.errorCode) {
          this._treatSelectionPayload(resp.workload);
        }
      });
  }

  getPossibleSelection() {
    this.selectionService.getPossibleSelection('', ['Team', 'User'])
      .subscribe(workload => {
        if (!workload.errorCode) {
          this.possibleSelection = workload.workload;
          this.selections = workload.workload;
        }
      });
  }

  reset() {
    this.close.emit(false);
    this.closeModalIfNeeded(false);
  }

  confirm(res: any = true) {
    this.close.emit(res);
    this.closeModalIfNeeded(res);
  }


  private closeModalIfNeeded(res?: any) {
    if (this.modalRef) {
      this.modalRef.close(res);
    }
  }

  /**
   * Treat selection payload from API
   * @param payload 
   */
  private _treatSelectionPayload(payload: SelectionPayload) {
    this.currentSelection = payload;
    // this.nbUser = _.uniq(_.reduce(this.currentSelection, (s, e) => _.union(s, e.emails), new Array<string>())).length;
    this.getPossibleSelection();
  }
}
