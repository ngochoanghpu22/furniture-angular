import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ModalConfig, ModalRef } from '@design-system/core';
import { AvailableColors, AvailableIcons, ManagerOrganizationService, MessageService } from '@flex-team/core';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { Observable, throwError } from 'rxjs';
import { ManagerOrganizationModalBaseComponent } from '../modal-base.component';

@Component({
  selector: 'manager-office-modal-add-working-status',
  templateUrl: './modal-add-working-status.component.html',
  styleUrls: ['./modal-add-working-status.component.scss']
})
export class ManagerOrganizationModalAddWorkingStatusComponent extends ManagerOrganizationModalBaseComponent {
  @ViewChild('pop') popoverRef: PopoverDirective;

  availableIcons: string[] = AvailableIcons;
  availableColors: string[] = AvailableColors;

  showErrBorder = false;
  randomValues: { icon: string, color: string };

  constructor(
    modalRef: ModalRef, fb: FormBuilder,
    managerOrganizationService: ManagerOrganizationService,
    config: ModalConfig, messageService: MessageService
  ) {
    super(modalRef, fb, managerOrganizationService, config, messageService);
    this._randomIconColor();
  }

  ngOnInit() {
    super.ngOnInit();
  }

  initFormGroup(): void {

    this.data.name = this.data.name || this.randomValues.icon;
    this.data.color = this.data.color || this.randomValues.color;

    this.form.addControl('name', new FormControl({
      value: null, disabled: true
    }, [Validators.required]));
    this.form.addControl('address', new FormControl({ value: null, disabled: false }, [Validators.required]));
    this.form.addControl('isRemoteWork', new FormControl({ value: null, disabled: false }));
    this.form.addControl('color', new FormControl({
      value: null,
      disabled: true
    }));

    this.form.controls.name.disable();

  }

  save(dto: any): Observable<any> {
    dto.address = this.form.controls.address.value;
    dto.name = this.form.controls.name.value;
    dto.color = this.form.controls.color.value;
    if (!dto.name) {
      this.showErrBorder = true;
      return throwError('Please select icon');
    }
    return this.managerOrganizationService.addOrEditWorkingStatus(dto);
  }

  onIconSelected({ icon, color }: any) {
    this.showErrBorder = false;
    this.form.controls.name.setValue(icon);
    this.form.controls.color.setValue(color);
  }

  private _randomIconColor() {
    this.randomValues = {
      color: this.availableColors[Math.floor(Math.random() * this.availableColors.length)],
      icon: this.availableIcons[Math.floor(Math.random() * this.availableIcons.length)]
    };
  }

}
