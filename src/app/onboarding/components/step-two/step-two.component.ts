import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, AuthProvider, SamePasswordValidator, User } from '@flex-team/core';
import { OnboardingViewService } from '../../services';
import { BaseStepComponent } from '../base-step.component';


@Component({
  selector: 'fxt-step-two',
  templateUrl: './step-two.component.html',
  styleUrls: ['./step-two.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepTwoComponent extends BaseStepComponent {

  ownerFirstName: string = '';
  form: FormGroup = new FormGroup({});
  owner: User = new User();
  submitted = false;

  team: string = '';
  manager: string = '';
  get f() {
    return this.form.controls;
  }
  constructor(
    private authService: AuthenticationService,
    private viewService: OnboardingViewService,
    private formBuilder: FormBuilder) {
    super(authService, viewService);
    this.step = 2;
  }

  ngOnInit() {

    super.ngOnInit();

    this._viewService.onboarding$.subscribe(data => {
      this.owner = data.owner;
      this.team = data.team;
      this.manager = data.manager;
    })

    this.form = this.formBuilder.group({
      lastName: [this.owner.lastName, Validators.required],
      firstName: [this.owner.firstName, Validators.required],
      fullName: [null, Validators.required],
      password: [this.viewService.password, Validators.required],
      confirmPassword: [this.viewService.password, [Validators.required]]
    },
      <AbstractControlOptions>{
        validator: [
          SamePasswordValidator()
        ]
      });

    this.form.valueChanges.subscribe(data => {
      if (this.form.controls.fullName.untouched || !this.form.controls.fullName.value) {
        const firstName = this.form.controls.firstName.value || '';
        const lastName = this.form.controls.lastName.value || '';
        const fullNameByDefault = `${firstName} ${lastName.length > 0 ? lastName[0].toUpperCase() : ''}`;
        this.form.controls.fullName.patchValue(fullNameByDefault.trim(), {
          emitEvent: false
        });
      }
    })
  }

  confirm() {
    if (this.form.invalid){
      this.f.password.markAsTouched();
      this.f.lastName.markAsTouched();
      this.f.firstName.markAsTouched();
      return;
    }
    this.submitted = true;
    this.viewService.updatePersoInfos(this.form.getRawValue(), null, AuthProvider.None);
    this.navigate.emit(this.step + 1);
  }
}
