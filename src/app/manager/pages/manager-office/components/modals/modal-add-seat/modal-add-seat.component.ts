import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalConfig, ModalRef } from '@design-system/core';
import { ManagerSeatService, MessageService, Office, Seat } from '@flex-team/core';

@Component({
  selector: 'app-modal-add-seat',
  templateUrl: './modal-add-seat.component.html',
  styleUrls: ['./modal-add-seat.component.scss']
})
export class ModalAddSeatComponent implements OnInit {

  office: Office;
  seat: Seat;
  form: FormGroup;

  equipments: string[] = [];
  equipmentsInline: string = "";
  officeList: Office[];

  constructor(
    protected config: ModalConfig,
    private fb: FormBuilder,
    private modalRef: ModalRef,
    private managerSeatService: ManagerSeatService,
    private messageService: MessageService
  ) {
    this.office = this.config.data.office;
    this.officeList = this.config.data.officeList || [];
    this.seat = this.config.data.seat || {};
  }

  ngOnInit() {
    this.equipments = this.seat?.equipments || [];
    this.form = this.fb.group({
      id: [this.seat?.id],
      officeId: [this.office.id, [Validators.required]],
      name: [this.seat?.name, [Validators.required]],
      newEquipment: [null],
      equipments: [this.equipments]
    });
  }

  addNewEquiment(event?: any) {
    if (event) {
      event.preventDefault();
    }
    const newEquipment = this.form.controls.newEquipment.value;
    if (!newEquipment) return;
    if (newEquipment && this.equipments.indexOf(newEquipment) < 0) {
      this.equipments.push(newEquipment);
      this.equipmentsInline = this.equipments.join('-#SEPARATOR#-');
    }
    this.form.controls.equipments.setValue(this.equipments);
    this.form.controls.newEquipment.reset();
  }

  removeEquipment(val: string) {
    this.equipments = this.equipments.filter(x => x != val);
    this.equipmentsInline = this.equipments.join('-#SEPARATOR#-');
    this.form.controls.equipments.setValue(this.equipments);
  }

  close(res?: any) {
    this.modalRef.close(res);
  }

  save() {
    const dto = this.form.getRawValue();
    dto.equipmentsInline = dto.equipments.join('-#SEPARATOR#-');
    this.managerSeatService.addOrEditSeat(this.office.idFloor, dto).subscribe(resp => {
      this.messageService.success();
      this.close(resp.workload);
    })
  }

}
