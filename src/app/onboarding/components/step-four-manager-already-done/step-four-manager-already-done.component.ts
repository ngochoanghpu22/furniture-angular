import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, InviteUser } from '@flex-team/core';
import { OnboardingViewService } from '../../services';
import { BaseStepComponent } from '../base-step.component';

@Component({
  selector: 'fxt-step-four-manager-already-done',
  templateUrl: './step-four-manager-already-done.component.html',
  styleUrls: ['./step-four-manager-already-done.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepFourManagerAlreadyDoneComponent extends BaseStepComponent {


  constructor(
    private authService: AuthenticationService,
    private viewService: OnboardingViewService,
    private formBuilder: FormBuilder) {
    super(authService, viewService);
  }

  ngOnInit() {

    super.ngOnInit();
    this.step = this.isOnlyUser ? 3 : 3;
  }

  confirm() {
    this._viewService.hierarchyTeamName = '';
    this._viewService.hierarchyTeam = [];
    this.navigate.emit(this.step + 1);
  }

}
