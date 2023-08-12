import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AuthenticationService, Onboarding, UserRole } from '@flex-team/core';
import { OnboardingViewService } from '../services';

const Max_Pages_User = 5;
const Max_Pages_Manager = 6;

@Component({
  selector: '',
  template: '',
  styleUrls: []
})
export class BaseStepComponent implements OnInit {

  @Input() onboarding: Onboarding = new Onboarding();

  @Output() navigate: EventEmitter<number> = new EventEmitter<number>();

  step: number = 1;

  maxPage: number = 5;

  isOnlyUser: boolean = false;

  constructor(
    protected _authService: AuthenticationService,
    protected _viewService: OnboardingViewService) {

  }

  ngOnInit() {

    this._viewService.onboarding$.subscribe((data) => {
      this.isOnlyUser = this._authService.userHasRole(data.owner, UserRole.User);
      this.maxPage = this.isOnlyUser ? Max_Pages_User : Max_Pages_Manager;
    })


  }

}
