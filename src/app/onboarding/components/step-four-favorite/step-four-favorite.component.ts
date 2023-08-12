import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { AuthenticationService, SelectionItem, SelectionPayload, SelectionService } from '@flex-team/core';
import { OnboardingViewService } from '../../services';
import { BaseStepComponent } from '../base-step.component';

@Component({
  selector: 'fxt-step-four-favorite',
  templateUrl: './step-four-favorite.component.html',
  styleUrls: ['./step-four-favorite.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepFourFavoriteComponent extends BaseStepComponent {

  public currentSelection: SelectionPayload;
  public selections: SelectionItem[] = [];

  team: string = '';

  constructor(
    private authService: AuthenticationService,
    private viewService: OnboardingViewService,
    private selectionService: SelectionService, private cd: ChangeDetectorRef) {
    super(authService, viewService);
  }

  ngOnInit() {

    super.ngOnInit();
    this.step = this.isOnlyUser ? 4 : 5;

    this.updateData();

    this._viewService.onboarding$.subscribe(data => {
      this.team = data.team;
    })

  }


  selectEvent(item: SelectionItem) {
    this.addToSelection(item);
  }

  addToSelection(item: SelectionItem) {
    this.selectionService.addToSelection(item, this._viewService.onboardingToken)
      .subscribe(workload => {
        if (!workload.errorCode) {
          this.updateData();
        }
        this.cd.detectChanges();
      });
  }

  deleteFromList(selectedItem: SelectionItem) {
    this.selectionService.deleteFromSelection(selectedItem, this._viewService.onboardingToken)
      .subscribe(workload => {
        if (!workload.errorCode) {
          this.updateData();
        }
        this.cd.detectChanges();
      });
  }

  private updateData() {
    this.getCurrentSelection();
    this.updatePossibleSelection();
  }

  private updatePossibleSelection() {
    this.selectionService.getPossibleSelection(this._viewService.onboardingToken, ['User'])
      .subscribe(workload => {
        if (!workload.errorCode) {
          this.selections = workload.workload;
          this.cd.detectChanges();
        }
      });
  }

  private getCurrentSelection() {
    this.selectionService.getCurrentSelection(this._viewService.onboardingToken)
      .subscribe(resp => {
        if (!resp.errorCode) {
          this.currentSelection = resp.workload;
          this.cd.detectChanges();
        }
      });
  }

}
