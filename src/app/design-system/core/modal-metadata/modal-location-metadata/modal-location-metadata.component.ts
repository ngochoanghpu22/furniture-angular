import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  AvailableColors, AvailableIcons, IMetadataItem, IMetadataTemplate,
  ManagerOrganizationService, MessageService,
  MetadataTypes, WorkingStatus
} from '@flex-team/core';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { Observable, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { isArray } from 'underscore';
import { ModalSearchGooglemapLocationComponent } from '../../google-map-searchbox';
import { ModalConfig, ModalRef, ModalService } from '../../modal';
import { ModalConfirmationComponent } from '../../modal/modal-templates';

const MetadataItemForRemoteWorkAtHome = <IMetadataItem>{
  name: 'Which Home ?',
  type: MetadataTypes.Dropdown,
  defaultData: 'Home 1, Home 2, Home 3',
}

const MetadataItemForRemoteWorkTravelling = <IMetadataItem>{
  name: 'Destination ?',
  type: MetadataTypes.Geodata,
  defaultData: '',
}

const MetadataItemForInOffice = <IMetadataItem>{
  name: 'Lunch Option ?',
  type: MetadataTypes.Checkbox,
  defaultData: 'Building 1 restaurant, Building 2 restaurant, delivered at my desk',
}

const MetadataItemForAbsence = <IMetadataItem>{
  name: 'Reason ?',
  type: MetadataTypes.FreeText,
  defaultData: '',
}

const Type_Options: { label: string, value: MetadataTypes }[] = [
  { value: MetadataTypes.FreeText, label: 'main.free_text' },
  { value: MetadataTypes.Dropdown, label: 'main.combo' },
  { value: MetadataTypes.Checkbox, label: 'main.checkbox' },
  { value: MetadataTypes.Geodata, label: 'main.geodata' },
]


@Component({
  selector: 'modal-location-metadata',
  templateUrl: './modal-location-metadata.component.html',
  styleUrls: ['./modal-location-metadata.component.scss']
})
export class ModalLocationMetadataComponent {

  @ViewChild('pop') popoverRef: PopoverDirective;

  availableIcons: string[] = AvailableIcons;
  availableColors: string[] = AvailableColors;
  typeOptions: { label: string, value: MetadataTypes }[] = Type_Options;

  showErrBorder = false;
  randomValues: { icon: string, color: string };

  form: FormGroup;
  data: IMetadataTemplate;
  submitted: boolean;
  selectedLocation: WorkingStatus;
  MetadataTypesEnum = MetadataTypes;

  canEditIcon = true;

  constructor(
    private modalRef: ModalRef,
    private fb: FormBuilder,
    public config: ModalConfig,
    private messageService: MessageService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
    private managerOrganizationService: ManagerOrganizationService
  ) {
    this.selectedLocation = config.data || {};

    this.canEditIcon = this.selectedLocation.id ? this.selectedLocation?.isIconChangable : true;

    this._randomIconColor();

    this.form = this.fb.group({
      id: [this.selectedLocation.id],
      name: [{
        value: this.selectedLocation.name || this.randomValues.icon,
        disabled: true
      }, [Validators.required]],
      address: [{
        value: this.selectedLocation?.address,
        disabled: !this.canEditIcon
      }, [Validators.required]],
      color: [{
        value: this.selectedLocation.color || this.randomValues.color,
        disabled: true
      }, [Validators.required]],
      isRemoteWork: [{
        value: this.selectedLocation.isRemoteWork,
        disabled: !this.canEditIcon
      }],
      metadataItems: this.fb.array([]),
    });
  }

  ngOnInit() {
    if (this.selectedLocation.id) {
      this.getLocationMetadata(this.selectedLocation.id);
    }
  }

  getLocationMetadata(locationId: string) {
    this.managerOrganizationService.getLocationMetadata(locationId)
      .subscribe(resp => {
        if (resp.errorCode) {
          this.messageService.error(resp.errorMessage);
        } else {
          this.data = resp.workload as IMetadataTemplate;

          if (this.data.metadataItems?.length > 0) {
            this.data.metadataItems.forEach(t => {
              this.addMetadata(t);
            });
          }
        }
        this.form.updateValueAndValidity();
      });
  }

  getData(i: number): string[] {
    return this.metadataArray.controls[i].get('dataArray').value;
  }

  addTagFn(i: any, name: any) {
    this.metadataArray.controls[i].patchValue({ 'isShow': true });
    let arr = this.getData(i) || [];

    if (arr[0].length == 0) {
      arr.pop();
    }

    arr.push(name);

    this.metadataArray.controls[i].patchValue({ 'dataArray': arr });
    return name;
  }

  get metadataArray() {
    return this.form.get('metadataItems') as FormArray;
  }

  isFreeText(i: number) {
    const type = Number(this.metadataArray.controls[i].get('type').value);
    return type === MetadataTypes.FreeText || type === MetadataTypes.Geodata;
  }

  typeChanged(i: number, value: any) {
    if (this.isFreeText(i)) {
      let dVal = this.metadataArray.controls[i].get('defaultData').value as string;
      var arr = isArray(dVal) ? dVal : dVal.split(',');
      this.metadataArray.controls[i].patchValue({ 'defaultData': arr?.join(",") });
    } else if (Number(value) === MetadataTypes.Geodata) {
      this.openModalGoogleMapSearchBox(i);
    }
    else {
      let dVal = this.metadataArray.controls[i].get('defaultData').value as string;
      if (dVal?.length > 0) {
        var arrary = isArray(dVal) ? dVal : dVal.split(',');
        this.metadataArray.controls[i].patchValue({ 'defaultData': arrary })
        this.metadataArray.controls[i].patchValue({ 'dataArray': arrary })
      }
    }
  }

  openModalGoogleMapSearchBox(i: number) {
    const modalRef = this.modalService.open(ModalSearchGooglemapLocationComponent, {
      width: '80%',
      height: '450px',
      customClass: 'modal-search-googlemap-location',
      data: { lat: null, lng: null }
    });

    modalRef.afterClosed$.subscribe(res => {
      this.metadataArray.controls[i].patchValue({ 'defaultData': JSON.stringify(res) });
      this.metadataArray.controls[i].patchValue({ 'dataArray': [] });
      this.form.markAsDirty();
    })
  }


  deleteMetadata(lessonIndex: number) {
    this.metadataArray.removeAt(lessonIndex);
    this.form.markAsDirty();
  }

  submitForm() {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: '400px'
    });
    modalRef.afterClosed$.subscribe(ok => {
      if (ok) {
        this.submitted = true;
        if (this.form.valid) {
          this.addOrEditLocationMetadata();
        }
      }
    })
  }

  cancel() {
    this.modalRef.close();
  }

  get populateForm() {
    let formData = {} as IMetadataTemplate;

    const form = this.form.getRawValue() as IMetadataTemplate;
    formData.id = form.id;
    formData.name = form.name;
    formData.locationId = form.locationId;
    formData.color = form.color;
    formData.address = form.address;
    formData.isRemoteWork = form.isRemoteWork;
    formData.locationId = this.selectedLocation.id;

    formData.metadataItems = [];

    form.metadataItems?.forEach((f, i) => {
      if (f.type === MetadataTypes.Geodata) {
        try {
          JSON.parse(f.defaultData);
        } catch {
          f.defaultData = null;
        }
      }
      formData.metadataItems.push({
        id: f.id,
        name: f.name,
        type: f.type,
        idMetadataTemplate: f.idMetadataTemplate,
        defaultData: this.getDefaultData(f.defaultData),
        isMandatory: f.isMandatory,
        showAnswerToEveryone: f.showAnswerToEveryone
      } as IMetadataItem);
    });

    return formData;
  }

  getDefaultData(data: any): string {
    return isArray(data) ? data.join(',') : data;
  }

  addMetadata(item?: IMetadataItem) {
    const defaultData = (item?.defaultData || '').split(',');

    item = item || this._getDefaultMetadataItem(this.selectedLocation);

    const templateForm = this.fb.group({
      id: [item?.id],
      isShow: item.id ? true : false,
      name: [item?.name, Validators.required],
      type: [item?.type, Validators.required],
      defaultData: [defaultData],
      dataArray: [defaultData],
      isMandatory: [item?.isMandatory || false],
      showAnswerToEveryone: [item?.showAnswerToEveryone || false]
    });

    this.metadataArray.push(templateForm);
    this.cdr.detectChanges();

  }

  saveLocation(dto: any): Observable<any> {
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

    if (this.selectedLocation.id && !this.selectedLocation?.isIconChangable) {
      return;
    }

    this.showErrBorder = false;
    this.form.controls.name.setValue(icon);
    this.form.controls.color.setValue(color);

    this.form.markAsDirty();
    this.form.updateValueAndValidity();
  }

  private addOrEditLocationMetadata() {
    this.managerOrganizationService.addOrEditLocationMetadata(this.populateForm)
      .pipe(take(1)).subscribe((data) => {

        if (data.statusCode !== 0) {
          this.messageService.error(data.errorMessage);
        } else {
          this.modalRef.close(data.workload);
          this.messageService.success();
        }
      }, err => {
        console.error('Fail to save', err);
      })
  }

  private _randomIconColor() {
    this.randomValues = {
      color: this.availableColors[Math.floor(Math.random() * this.availableColors.length)],
      icon: this.availableIcons[Math.floor(Math.random() * this.availableIcons.length)]
    };
  }

  private _getDefaultMetadataItem(selectedLocation: WorkingStatus): IMetadataItem {

    if (selectedLocation.isRemoteWork) {
      if (selectedLocation.name == 'home')
        return MetadataItemForRemoteWorkAtHome;
      else
        return MetadataItemForRemoteWorkTravelling;
    }

    if (selectedLocation.inOffice) {
      return MetadataItemForInOffice;
    }

    return MetadataItemForAbsence;
  }

}
