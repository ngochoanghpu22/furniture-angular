import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ModalConfig, ModalConfirmationComponent, ModalRef, ModalService } from '@design-system/core';
import { TimeSlotTemplateDTO, MessageService, TimeslotTemplateService } from '@flex-team/core';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

const Start_Hour = 24;

@Component({
  selector: 'app-timeslot-template-modal',
  templateUrl: './timeslot-template-modal.component.html',
  styleUrls: ['./timeslot-template-modal.component.scss']
})
export class TimeslotTemplateModalComponent implements OnInit {

  form: FormGroup;
  timeslot: TimeSlotTemplateDTO = new TimeSlotTemplateDTO()
  loading = false;

  hours: number[] = [];
  minutes: number[] = [];

  gmtHours: number[] = [];
  gmtMinutes: number[] = [0, 0.25, 0.5, 0.75];

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    protected config: ModalConfig,
    private modalRef: ModalRef,
    private timeslotTemplateService: TimeslotTemplateService,
    private messageService: MessageService,
    private modalService: ModalService,
    private timeSlotService: TimeslotTemplateService
  ) {
    this.timeslot = config.data;
    this.hours = Array.from({ length: Start_Hour }, (_, i) => i);
    this.minutes = [0, 30];
    for (let i = -12; i <= 12; i++) this.gmtHours.push(i);
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  private initForm() {
    this.form = this.formBuilder.group({
      dayOfWeek: [this.timeslot.dayOfWeek],
      id: [this.timeslot.id],
      name: [this.timeslot.name, Validators.required],
      startHour: [this.timeslot.startHour],
      startMinutes: [this.timeslot.startMinutes],
      stopHour: [this.timeslot.stopHour],
      stopMinutes: [this.timeslot.stopMinutes],
    }, {
      validator: this.startEndValidator
    });
  }

  startEndValidator(c: AbstractControl): ValidationErrors | null {
    const start = c.get('startHour')?.value * 60 + c.get('startMinutes')?.value;
    const end = c.get('stopHour')?.value * 60 + c.get('stopMinutes')?.value;

    if (start >= end) {
      return { startEndNotValid: true };
    }

    return null;
  }

  onSubmit() {
    if (this.form.invalid) return;
    const data: TimeSlotTemplateDTO = this.form.getRawValue();
    this.addOrEdit(data);
  }

  addOrEdit(data: TimeSlotTemplateDTO) {
    this.loading = true;

    this.timeslotTemplateService.addOrEditTimeSlot(data)
      .pipe(finalize(() => this.loading = false))
      .subscribe(resp => {
        if (resp.statusCode == 0) {
          this.modalRef.close(true);
          this.messageService.success('organization.create_timeslot_success');
        } else {
          this.messageService.error('organization.create_timeslot_failed');
        }
      })
  }

  tryDelete(id: string) {

    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto',
      disableClose: true,
    });

    modalRef.afterClosed$.subscribe(ok => {
      if (ok) {
        this.deleteTimeSlot(id);
      }
    })
  }

  private deleteTimeSlot(id: string) {
    this.timeSlotService.deleteTimeSlot(id)
      .subscribe(_ => {
        this.modalRef.close(true);
      })
  }

}
