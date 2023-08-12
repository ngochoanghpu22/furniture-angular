import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ModalConfig, ModalConfirmationComponent, ModalRef, ModalService } from '@design-system/core';
import {
  AuthenticationService,
  FormatDates,
  ManagerOfficeService, MessageService, NameValuePair, OccupationRecurrence, OccupationRule, OccupationType,
  SelectionItem, SelectionPayload, SelectionService
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { DateTime } from 'luxon';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

const atLeastAItemValidator = (c: AbstractControl): ValidationErrors | null => {
  const items = c.get('items')?.value || [];
  if (items.length == 0) {
    return { itemsEmpty: true };
  }
  return null;
}

@Component({
  selector: 'app-modal-add-occupation-rule',
  templateUrl: './modal-add-occupation-rule.component.html',
  styleUrls: ['./modal-add-occupation-rule.component.scss']
})
export class ModalAddOccupationRuleComponent implements OnInit {

  officeId: string;

  form: FormGroup;

  selectedDate: Date;
  periodText: string;

  selectedType: OccupationType = OccupationType.Reserve;

  bsConfig: Partial<BsDatepickerConfig> = {
    showWeekNumbers: false,
    containerClass: 'theme-default',
    daysDisabled: [6, 0],
    customTodayClass: 'today',
    isAnimated: true
  }

  selectedRecurrence: OccupationRecurrence;
  rules: NameValuePair[];

  selections: SelectionItem[] = [];
  currentSelection: SelectionPayload;

  dayName: string;

  OccupationTypeEnum = OccupationType;
  OccupationRecurrenceEnum = OccupationRecurrence;

  model: OccupationRule;
  canEditType = false;

  initialized = false;

  constructor(
    private selectionService: SelectionService,
    private managerOfficeService: ManagerOfficeService,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private translocoService: TranslocoService,
    private cd: ChangeDetectorRef,
    private modalConfig: ModalConfig,
    private modalRef: ModalRef,
    private modalService: ModalService,
    private messageService: MessageService
  ) {
    this.model = this.modalConfig.data?.model;
    this.selectedDate = this.model?.date || new Date();
    this.selectedRecurrence = this.model?.recurrence;
    this.selectedType = this.model?.type || OccupationType.Reserve;
    this.canEditType = this.model?.id == null;
    this.officeId = this.modalConfig.data?.officeId;
    this.currentSelection = {
      isAllCompany: false,
      isFavorites: false,
      items: (this.model?.items as any[] || []).map(x => {
        x.id = x.linkedUserOrTeamId;
        return x;
      })
    }
  }

  ngOnInit() {
    this.periodText = this.getPeriodText(this.selectedDate);
    this.updateRules();
    this.getPossibleSelection();

    this.form = this.fb.group({
      id: [this.model?.id],
      type: [this.selectedType, [Validators.required]],
      recurrence: [this.selectedRecurrence, [Validators.required]],
      date: [this.selectedDate, [Validators.required]],
      items: [this.currentSelection.items],
      numberWeeks: [this.model?.numberWeeks || 1],
      dayOfWeek: [this.model?.dayOfWeek || 1],
    }, {
      validator: atLeastAItemValidator
    });
  }

  onSelectionChanged(items: SelectionItem[]) {
    if (!this.initialized) {
      this.initialized = true;
      return;
    }

    this.currentSelection = {
      isAllCompany: false,
      isFavorites: false,
      items: items
    }

    this.form.controls['items'].setValue(this.currentSelection.items.map((x: any) => {
      x.linkedUserOrTeamId = x.id;
      return x;
    }));

    this.form.markAsDirty();
  }


  tryDelete() {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: '300px'
    })
    modalRef.afterClosed$.subscribe((isOk) => {
      if (isOk) {
        this.managerOfficeService.deleteOccupationRule(this.model.id).subscribe(resp => {
          if (resp) {
            this.messageService.success();
            this.modalRef.close(true);
          }
        })
      }
    });
  }

  saveChanges() {
    const values = this.form.getRawValue();
    this.managerOfficeService.addOrEditOccupationRule(this.officeId, values)
      .subscribe(resp => {
        if (resp) {
          this.messageService.success();
          this.modalRef.close(true);
        }
      })
  }

  cancel() {
    this.modalRef.close();
  }

  onRecurrenceChanged($event: any, value: any) {
    $event.preventDefault();
    $event.stopPropagation();
    this.form.controls['recurrence'].setValue(value);
    this.selectedRecurrence = value;
    this.form.markAsDirty();
  }

  onBsValueChange(event: any) {
    if (this.selectedDate != event) {
      this.selectedDate = event;
      this.form.controls['date'].setValue(this.selectedDate);
      this.periodText = this.getPeriodText(this.selectedDate);
      this.form.markAsDirty();
    }
  }

  deleteFromList(event: any) {
    this.currentSelection = {
      isAllCompany: false,
      isFavorites: false,
      items: this.currentSelection.items.filter(x => x.id !== event.id)
    }
    this.form.controls['items'].setValue(this.currentSelection.items.map((x: any) => {
      x.linkedUserOrTeamId = x.id;
      return x;
    }));

    this.form.markAsDirty();
  }

  selectTab(tabIndex: number) {
    if (!this.canEditType) return;
    this.selectedType = tabIndex;
    this.form.controls['type'].setValue(this.selectedType);
    this.form.markAsDirty();
  }

  private getPossibleSelection() {
    this.selectionService.getPossibleSelection('', ['Team', 'User'])
      .subscribe(workload => {
        if (!workload.errorCode) {
          this.selections = workload.workload;
        }
      });
  }

  private updateRules() {
    this.rules = [
      {
        value: OccupationRecurrence.Once,
        name: this.translocoService.translate('main.once')
      },
      {
        value: OccupationRecurrence.EveryWeekDayForWeeks,
        name: this.translocoService.translate('manager.every_weekday_for_weeks')
      },
      {
        value: OccupationRecurrence.EveryDayForWeeks,
        name: this.translocoService.translate('manager.every_day_for_weeks')
      },
    ];
  }

  private getPeriodText(date: Date): string {
    if (!date) return this.periodText;

    const formatDate = this.authService.formatDate;
    const toFormat = formatDate == FormatDates.MMddyyyy ? "LLL dd" : "dd LLL";
    const target = DateTime.fromJSDate(date);
    this.dayName = target.weekdayLong;
    return target.weekdayLong + ', ' + target.toFormat(toFormat);
  }

}
