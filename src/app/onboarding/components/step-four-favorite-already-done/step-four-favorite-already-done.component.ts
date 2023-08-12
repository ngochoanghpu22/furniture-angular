import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { AuthenticationService, SelectionItem, SelectionService } from '@flex-team/core';
import { OnboardingViewService } from '../../services';
import { BaseStepComponent } from '../base-step.component';

@Component({
  selector: 'fxt-step-four-favorite-already-done',
  templateUrl: './step-four-favorite-already-done.component.html',
  styleUrls: ['./step-four-favorite-already-done.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepFourFavoriteAlreadyDoneComponent extends BaseStepComponent {

  public currentSelection: SelectionItem[] = [];
  public selections: SelectionItem[] = [];

  team: string = '';

  constructor(
    private authService: AuthenticationService,
    private viewService: OnboardingViewService,
    private selectionService: SelectionService,
    private cd: ChangeDetectorRef) {
    super(authService, viewService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.step = this.isOnlyUser ? 4 : 5;

    this._viewService.onboarding$.subscribe(data => {
      this.team = data.team;
    })

  }




}
