import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OnboardingViewService } from '../../services';
import { BaseStepComponent } from '../base-step.component';
import { AuthenticationService } from '@flex-team/core';

@Component({
  selector: 'fxt-step-five',
  templateUrl: './step-five.component.html',
  styleUrls: ['./step-five.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepFiveComponent extends BaseStepComponent {

  constructor(
    private authService: AuthenticationService,
    private viewService: OnboardingViewService) {
    super(authService, viewService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.step = this.isOnlyUser ? 5 : 6;
  }

}
