import { Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ModalConfig, ModalRef } from '@design-system/core';
import { Floor, ManagerOfficeService, MessageService, OfficeType } from '@flex-team/core';
import { Observable } from 'rxjs';
import { ManagerOfficeModalBaseComponent } from '../modal-base.component';

@Component({
  selector: 'manager-office-modal-add-zone',
  templateUrl: './modal-add-zone.component.html',
  styleUrls: ['./modal-add-zone.component.scss']
})
export class ManagerOfficeModalAddZoneComponent extends ManagerOfficeModalBaseComponent {

  floor: Floor;

  imgURL: any;
  selectedFile: File;

  equipments: string[] = [];
  equipmentsInline: string = "";

  OfficeTypeEnum = OfficeType;

  constructor(
    modalRef: ModalRef, fb: FormBuilder, managerOfficeService: ManagerOfficeService,
    config: ModalConfig, messageService: MessageService
  ) {
    super(modalRef, fb, managerOfficeService, config, messageService);
    this.floor = this.config.data.floor;
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.floor.isDeskBookingEnabled) {
      this.form.controls['capacity'].disable();
    }
  }

  initFormGroup(): void {
    this.form.addControl('location', new FormControl(null));
    this.form.addControl('contextualPicture', new FormControl(null));
    this.form.addControl('newEquipment', new FormControl(null));
    this.form.addControl('equipments', new FormControl([]));
    this.form.addControl('idFloor', new FormControl(this.data.floorId));
    this.form.addControl('type', new FormControl(this.data.type));
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

  onFileChanged(imgData: any) {
    this.form.controls.contextualPicture.setValue(imgData);
  }

  save(dto: any): Observable<any> {
    dto.equipmentsInline = dto.equipments.join('-#SEPARATOR#-');
    return this.managerOfficeService.addOrEditOffice(dto);
  }

}
