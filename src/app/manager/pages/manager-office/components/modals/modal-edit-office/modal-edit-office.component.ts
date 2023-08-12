import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ModalConfig, ModalRef } from '@design-system/core';
import {
  AuthenticationService, AuthProvider, capacityAllowedLoadValidator, ManagerOfficeService,
  MessageService, Office, OfficeType
} from '@flex-team/core';
import { ManagerOfficeViewService } from '../../../services';

@Component({
  selector: 'manager-office-modal-edit-office',
  templateUrl: './modal-edit-office.component.html',
  styleUrls: ['./modal-edit-office.component.scss']
})
export class ManagerOfficeModalEditOfficeComponent implements OnInit {

  office: Office;

  form: FormGroup;
  hasChanges = false;

  authProvider: AuthProvider;
  authProviderLabel: string;

  AuthProviderEnum = AuthProvider;
  OfficeTypeEnum = OfficeType;

  isEquipmentCollapsed = false;
  isRuleCollapsed = false;

  canEdit = true;
  equipments: string[];

  contextualPicture: string;

  constructor(protected modalRef: ModalRef,
    protected managerOfficeService: ManagerOfficeService,
    protected config: ModalConfig,
    private managerOfficeViewService: ManagerOfficeViewService,
    private messageService: MessageService,
    private authService: AuthenticationService,
    private fb: FormBuilder
  ) {
    this.office = this.config.data.office;
    this.equipments = [...this.office.equipments];
    this.contextualPicture = this.office.contextualPicture;
    this.authProvider = this.authService.currentUser.authProvider;
    this.authProviderLabel = AuthProvider[this.authProvider];
    if (this.authProvider === AuthProvider.None) {
      this.authProviderLabel = 'Google/Microsoft';
    }
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: [this.office.name, [Validators.required]],
      location: [this.office.location],
      capacity: [this.office.capacity, [Validators.required]],
      numberOfDesks: [{
        value: this.office.seats.length,
        disabled: true
      }, [Validators.required]],
      allowedLoad: [this.office.allowedLoad, [Validators.required]],
      equipments: [this.office.equipments],
      newEquipment: [null],
    }, {
      validator: capacityAllowedLoadValidator
    });
  }

  cancel() {
    this.modalRef.close();
  }

  close(res?: any) {
    this.modalRef.close(res)
  }

  save() {
    if (this.form.invalid) return;
    const values = this.form.getRawValue();
    values.equipmentsInline = this.equipments.filter(x => x).join('-#SEPARATOR#-')
    const dto = {
      ...this.office,
      ...values,
      contextualPicture: this.contextualPicture
    };

    this.managerOfficeService.addOrEditOffice(dto).subscribe(resp => {
      if (!resp.errorCode) {
        this.messageService.success();
        this.managerOfficeViewService.needReload = true;
        this.close(resp.workload);
      }
    })
  }

  onFileChanged(imgData: any) {
    if (imgData) {
      this.contextualPicture = imgData;
      this.form.markAsDirty();
    }
  }

  addNewEquiment(event?: any) {
    if (event) {
      event.preventDefault();
    }
    const newEquipment = this.form.get('newEquipment').value;
    if (!newEquipment) return;
    if (this.equipments.indexOf(newEquipment) < 0) {
      this.equipments.push(newEquipment);
    }
    this.form.controls['equipments'].setValue(this.equipments);
    this.form.controls['newEquipment'].setValue(null);
  }

  removeEquipment(val: string) {
    this.equipments = this.equipments.filter(x => x != val);
    this.form.controls['equipments'].setValue(this.equipments);
  }


}
