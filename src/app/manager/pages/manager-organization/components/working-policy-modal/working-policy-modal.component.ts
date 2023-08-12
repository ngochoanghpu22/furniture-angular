import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalConfig, ModalConfirmationComponent, ModalRef, ModalService } from '@design-system/core';
import {
  AddEditWorkingPolicyDTO,
  AuthenticationService, ManagerOrganizationService, MessageService, User
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { of, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

const Max_Days_In_Weeks = 8;
const Max_Days_In_Months = 31;

@Component({
  selector: 'fxt-working-policy-modal',
  templateUrl: './working-policy-modal.component.html',
  styleUrls: ['./working-policy-modal.component.scss']
})
export class WorkingPolicyModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  policy: AddEditWorkingPolicyDTO = new AddEditWorkingPolicyDTO()
  loading = false;
  managers: User[] = [];

  optionsDayPerWeek: number[] = [];
  optionsDayPerMonth: number[] = [];

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    protected config: ModalConfig,
    private modalRef: ModalRef,
    private modalService: ModalService,
    private managerOrganizationService: ManagerOrganizationService,
    private messageService: MessageService,
    private authService: AuthenticationService,
    private translocoService: TranslocoService
  ) {
    this.policy = config.data;
    this.optionsDayPerWeek = Array.from({ length: Max_Days_In_Weeks }, (_, i) => i);
    this.optionsDayPerMonth = Array.from({ length: Max_Days_In_Months }, (_, i) => i);
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.initForm();

    this.form.get('isLimitOfficeDaysPerWeekEnabled').valueChanges
      .pipe(takeUntil(this._destroyed))
      .subscribe(val => {
        const validators = val ? [Validators.required] : [];
        this.form.controls.maxNumberOfOfficeDaysPerWeek.setValidators(validators);
        this.form.updateValueAndValidity();
      })

  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      id: [this.policy?.id],
      name: [this.policy?.name, Validators.required],
      isLimitOfficeDaysPerWeekEnabled: [this.policy?.isLimitOfficeDaysPerWeekEnabled || false],
      isLimitRemoteDaysPerWeekEnabled: [this.policy?.isLimitRemoteDaysPerWeekEnabled || false],
      isLimitRemoteDaysPerMonthEnabled: [this.policy?.isLimitRemoteDaysPerMonthEnabled || false],
      isAllowRemoteExceptionEnabled: [this.policy?.isAllowRemoteExceptionEnabled || false],
      maxNumberOfRemoteDaysPerWeek: [this.policy?.maxNumberOfRemoteDaysPerWeek || 0],
      maxNumberOfRemoteDaysPerMonth: [this.policy?.maxNumberOfRemoteDaysPerMonth || 0],
      maxNumberOfOfficeDaysPerWeek: [this.policy?.maxNumberOfOfficeDaysPerWeek || 0],
      remoteExceptionContactId: [this.policy?.remoteExceptionContactId],
      companyId: [this.policy?.companyId || this.authService.currentUser.idCompany],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const data: AddEditWorkingPolicyDTO = this.form.value;

    if (!data.isLimitOfficeDaysPerWeekEnabled) {
      data.maxNumberOfOfficeDaysPerWeek = 0;
    }

    if (!data.isLimitRemoteDaysPerWeekEnabled) {
      data.maxNumberOfRemoteDaysPerWeek = 0;
    }

    const action$ = this.checkIfNeedConfirm(data)
      ? this.modalService.open(ModalConfirmationComponent, {
        width: '500px',
        data: {
          message: this.translocoService.translate('organization.changing_working_policy_confirmation')
        }
      }).afterClosed$
      : of(true);

    action$.subscribe((isOk) => {
      if (isOk) {
        this.addOrEdit(data);
      }
    })

  }

  addOrEdit(data: AddEditWorkingPolicyDTO) {
    this.loading = true;

    this.managerOrganizationService.addOrEditWorkingPolicy(data)
      .pipe(finalize(() => this.loading = false))
      .subscribe(r => {
        this.modalRef.close(true);
        this.messageService.success(data.id
          ? 'organization.update_success'
          : 'organization.create_success');
      })
  }

  private checkIfNeedConfirm(formValues: AddEditWorkingPolicyDTO): boolean {
    let shouldConfirm = false;

    if (this.policy && formValues.isLimitRemoteDaysPerWeekEnabled) {
      if (!this.policy.isLimitRemoteDaysPerWeekEnabled) {
        shouldConfirm = true;
      } else {
        if (formValues.maxNumberOfRemoteDaysPerWeek < this.policy.maxNumberOfRemoteDaysPerWeek) {
          shouldConfirm = true;
        }
      }
    }

    if (this.policy && formValues.isLimitOfficeDaysPerWeekEnabled) {
      if (!this.policy.isLimitOfficeDaysPerWeekEnabled) {
        shouldConfirm = true;
      } else {
        if (formValues.maxNumberOfOfficeDaysPerWeek < this.policy.maxNumberOfOfficeDaysPerWeek) {
          shouldConfirm = true;
        }
      }
    }

    if (!formValues.isAllowRemoteExceptionEnabled &&
      this.policy?.isAllowRemoteExceptionEnabled) {
      shouldConfirm = true;
    }

    return shouldConfirm && this.policy?.numberOfUsers > 0;


  }

}
