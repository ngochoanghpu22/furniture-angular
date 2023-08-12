import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, InviteUser } from '@flex-team/core';
import { OnboardingViewService } from '../../services';
import { BaseStepComponent } from '../base-step.component';

@Component({
  selector: 'fxt-step-four-manager',
  templateUrl: './step-four-manager.component.html',
  styleUrls: ['./step-four-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepFourManagerComponent extends BaseStepComponent {

  public form: FormGroup = new FormGroup({});

  public hierarchyTeam: InviteUser[] = [];


  constructor(
    private authService: AuthenticationService,
    private viewService: OnboardingViewService,
    private formBuilder: FormBuilder) {
    super(authService, viewService);
  }

  ngOnInit() {

    super.ngOnInit();
    this.step = this.isOnlyUser ? 3 : 3;

    this.form = this.formBuilder.group({
      team: [null, Validators.required],
      lastName: [null, Validators.required],
      firstName: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]]
    });
  }

  trackByFn(index: number, item: InviteUser) {
    return item.email;
  }

  addUser() {

    const { firstName, lastName, email } = this.form.value;

    for (var i = 0; i < this.hierarchyTeam.length; i++) {
      if (this.hierarchyTeam[i].email === email) {
        return;
      }
    }

    const found = this.hierarchyTeam.find(x => x.email === email);
    if (!found) {
      this.hierarchyTeam.push(new InviteUser(
        {
          firstName: firstName,
          lastName: lastName,
          fullName: firstName + ' ' + lastName[0] + '.',
          email: email
        }));
    }


  }

  deleteUser(item: InviteUser) {

    const foundIndex = this.hierarchyTeam.findIndex(x => x.email === item.email);
    if (foundIndex >= 0) {
      this.hierarchyTeam.splice(foundIndex, 1);
    }
  }

  confirm() {
    this._viewService.hierarchyTeamName = this.form.controls['team'].value;
    this._viewService.hierarchyTeam = this.hierarchyTeam;
    this.navigate.emit(this.step + 1);
  }

}
