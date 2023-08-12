import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalConfig, ModalRef, ModalService } from '@design-system/core';
import { AuthenticationService, AuthProvider, ExternalOfficeDTO, Floor, LinkToExternalOfficeRequest, ManagerOfficeService, MessageService, Office, OfficeType } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { ArchiveConfirmationModalComponent } from 'src/app/manager/components';
import { ManagerOfficeViewService } from '../../../services';
import { ManagerOfficeModalEditOfficeComponent } from '../modal-edit-office/modal-edit-office.component';
import { ModalListExternalOfficeComponent } from '../modal-list-external-office/modal-list-external-office.component';

@Component({
  selector: 'manager-office-modal-detail-office',
  templateUrl: './modal-detail-office.component.html',
  styleUrls: ['./modal-detail-office.component.scss']
})
export class ManagerOfficeModalDetailOfficeComponent implements OnInit, OnDestroy {

  office: Office;
  floor: Floor;

  form: FormGroup;

  newEquipment: string = '';

  authProvider: AuthProvider;
  authProviderLabel: string;

  AuthProviderEnum = AuthProvider;
  OfficeTypeEnum = OfficeType;

  isEquipmentCollapsed = false;
  isRuleCollapsed = false;

  canEdit = true;
  equipments: string[];
  contextualPicture: string;

  private _destroyed = new Subject<void>();

  constructor(protected modalRef: ModalRef,
    protected managerOfficeService: ManagerOfficeService,
    protected config: ModalConfig,
    private managerOfficeViewService: ManagerOfficeViewService,
    private messageService: MessageService,
    private authService: AuthenticationService,
    private modalService: ModalService,
    private translocoService: TranslocoService,
    private cd: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.office = this.config.data.office;
    this.floor = this.config.data.floor;
    this.contextualPicture = this.office.contextualPicture;
    this.equipments = [...this.office.equipments];
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
      capacity: [{
        value: this.office.capacity,
        disabled: this.floor.isDeskBookingEnabled
      }, [Validators.required]],
      numberOfDesks: [{
        value: this.office.seats.length,
        disabled: true
      }, [Validators.required]],
      allowedLoad: [this.office.allowedLoad, [Validators.required]],
      equipments: [this.office.equipments],
    });

    this.form.valueChanges.pipe(takeUntil(this._destroyed), debounceTime(400)).subscribe(val => {
      this.submitForm();
    })
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  submitForm() {
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
      }
    })
  }

  showModalEditOffice() {
    const modalRef = this.modalService.open(ManagerOfficeModalEditOfficeComponent,
      {
        width: '350px',
        disableClose: true,
        escToClose: true,
        data: {
          office: this.office,
        }
      }
    );

    modalRef.afterClosed$.subscribe((data) => {
      if (data) {
        const now = new Date();
        this.office = {
          ...data,
          contextualPicture: data.contextualPicture
            ? `${data.contextualPicture}?${now.getTime()}` : null
        };
        this.cd.detectChanges();
      }
    });
  }

  archive(office: Office) {
    const modalRef = this.modalService.open(ArchiveConfirmationModalComponent, {
      width: '400px',
      data: {
        name: office.name,
        type: this.translocoService.translate('main.zone')
      }
    })
    modalRef.afterClosed$.subscribe((result) => {
      if (result && result.ok) {
        this.managerOfficeService.addOrEditOffice({
          ...office,
          archived: true,
          archivedDate: result.value
        }).subscribe(r => {
          if (r.errorCode === '') {
            this.messageService.success();
            this.managerOfficeViewService.needReload = true;
            this.modalRef.close({ archived: true });
          }
        });
      }
    });
  }

  save() {
    this.managerOfficeService.addOrEditOffice(this.office).subscribe(data => {
      this.messageService.success();
      this.managerOfficeViewService.needReload = true;
    })
  }

  onFileChanged(imgData: any) {
    if (imgData) {
      this.office.contextualPicture = imgData;
      this.save();
    }
  }

  addNewEquiment(event?: any) {
    if (event) {
      event.preventDefault();
    }

    if (!this.newEquipment) return;
    if (this.equipments.indexOf(this.newEquipment) < 0) {
      this.equipments.push(this.newEquipment);
    }
    this.form.controls['equipments'].setValue(this.equipments);
    this.newEquipment = null;
  }

  removeEquipment(val: string) {
    this.equipments = this.equipments.filter(x => x != val);
    this.form.controls['equipments'].setValue(this.equipments);
  }

  onLinkButtonClicked() {
    if (this.authProvider == AuthProvider.None) return;
    const modalRef = this.modalService.open(ModalListExternalOfficeComponent, {
      width: '700px',
      maxHeight: '600px',
      data: {
        authProvider: this.authProvider,
        office: this.office
      }
    });

    modalRef.afterClosed$.subscribe((externalOffice: ExternalOfficeDTO) => {
      if (externalOffice) {
        if (this.authProvider == AuthProvider.Microsoft) {
          this.office.msUniqueId = externalOffice.uniqueId;
        }

        if (this.authProvider == AuthProvider.Google) {
          this.office.googleUniqueId = externalOffice.uniqueId;
        }
        this.office.name = externalOffice.displayName;
        this.messageService.success();
        this.managerOfficeViewService.needReload = true;
      }
    })
  }

  unlinkButtonClicked() {
    if (this.authProvider == AuthProvider.None) return;
    this.unlinkFromExternalOffice(this.office.id);
  }

  private unlinkFromExternalOffice(officeId: string) {
    const req = <LinkToExternalOfficeRequest>{
      officeId: officeId,
      toRemoveLink: true,
      authProvider: this.authProvider
    }
    this.managerOfficeService.linkOfficeToExternalOffice(req)
      .subscribe(resp => {
        if (this.authProvider == AuthProvider.Microsoft) {
          this.office.msUniqueId = null;
        }

        if (this.authProvider == AuthProvider.Google) {
          this.office.googleUniqueId = null;
        }
        this.messageService.success();
        this.managerOfficeViewService.needReload = true;
      })
  }

}
