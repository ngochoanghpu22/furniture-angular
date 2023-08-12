import { Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ModalConfig, ModalRef, ModalSearchGooglemapLocationComponent, ModalService } from '@design-system/core';
import { ManagerOfficeService, MessageService } from '@flex-team/core';
import { Observable } from 'rxjs';
import { ManagerOfficeModalBaseComponent } from '../modal-base.component';

@Component({
  selector: 'manager-office-modal-add-building',
  templateUrl: './modal-add-building.component.html',
  styleUrls: ['./modal-add-building.component.scss']
})
export class ManagerOfficeModalAddBuildingComponent extends ManagerOfficeModalBaseComponent {

  constructor(
    modalRef: ModalRef, fb: FormBuilder, managerOfficeService: ManagerOfficeService,
    config: ModalConfig, messageService: MessageService,
    private modalService: ModalService
  ) {
    super(modalRef, fb, managerOfficeService, config, messageService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  initFormGroup(): void {
    this.form.addControl('location', new FormControl({ value: null, disabled: true }));
    this.form.addControl('lat', new FormControl(null));
    this.form.addControl('lng', new FormControl(null));
  }

  save(dto: any): Observable<any> {
    dto.location = this.form.controls.location.value;
    return this.managerOfficeService.addOrEditBuilding(dto);
  }

  openModalGoogleMapSearchBox() {
    const modalRef = this.modalService.open(ModalSearchGooglemapLocationComponent, {
      width: '80%',
      height: '450px',
      data: { lat: this.form.controls.lat.value, lng: this.form.controls.lng.value }
    });

    modalRef.afterClosed$.subscribe(res => {
      this.form.patchValue(res);
    })
  }

}
