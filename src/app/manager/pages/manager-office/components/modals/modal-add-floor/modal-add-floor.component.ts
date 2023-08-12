import { Component } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ModalConfig, ModalRef, ModalService } from '@design-system/core';
import { EditFloorDTO, ManagerOfficeService, MessageService } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { Observable } from 'rxjs';
import { ArchiveConfirmationModalComponent } from 'src/app/manager/components';
import { ManagerOfficeModalBaseComponent } from '../modal-base.component';

@Component({
  selector: 'manager-office-modal-add-floor',
  templateUrl: './modal-add-floor.component.html',
  styleUrls: ['./modal-add-floor.component.scss']
})
export class ManagerOfficeModalAddFloorComponent extends ManagerOfficeModalBaseComponent {

  isMapChanged = false;

  constructor(
    modalRef: ModalRef, fb: FormBuilder,
    managerOfficeService: ManagerOfficeService,
    config: ModalConfig, messageService: MessageService,
    private modalService: ModalService,
    private translocoService: TranslocoService
  ) {
    super(modalRef, fb, managerOfficeService, config, messageService);
  }


  ngOnInit() {
    super.ngOnInit();
  }

  initFormGroup(): void {
    this.form.addControl('contextualPicture', new FormControl(this.data.contextualPicture));
    this.form.addControl('idBuilding', new FormControl(this.data.buildingId));
  }

  onFileChanged(imgData: any) {
    this.isMapChanged = true;
    this.form.controls.contextualPicture.setValue(imgData);
    this.form.markAsDirty();
  }

  save(dto: EditFloorDTO): Observable<any> {
    if (!this.isMapChanged) {
      delete dto.contextualPicture;
    }
    return this.managerOfficeService.addOrEditFloor(dto);
  }

  archive() {
    const modalRef = this.modalService.open(ArchiveConfirmationModalComponent, {
      width: '400px',
      data: {
        name: this.data.name,
        type: this.translocoService.translate('main.floor')
      }
    })
    modalRef.afterClosed$.subscribe((result) => {
      if (result && result.ok) {
        this.managerOfficeService.archiveFloor({ id: this.data.id, archiveDate: result.value }).subscribe(r => {
          if (r.errorCode === '') {
            this.modalRef.close({ archived: true });
          }
        });
      }
    });
  }

}
