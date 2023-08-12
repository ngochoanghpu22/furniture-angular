import { Component } from '@angular/core';
import {
  IMetadataItem, IMetadataValue, IMetadataView, Location,
  LocationDetailDTO, ManagerUserData, MetadataTypes
} from '@flex-team/core';
import { isEmpty } from 'underscore';
import { ModalSearchGooglemapLocationComponent } from '../../google-map-searchbox';
import { ModalConfig, ModalRef } from '../../modal';
import { ModalService } from '../../modal/modal.service';


@Component({
  selector: 'modal-add-metadatavalues',
  templateUrl: './modal-add-metadatavalues.component.html',
  styleUrls: ['./modal-add-metadatavalues.component.scss']
})
export class ModalMetadataValuesComponent {
  valueModel: Array<IMetadataValue> = [];
  itemsModel: Array<IMetadataItem> = [];
  viewModel: Array<IMetadataView> = [];
  submitted: boolean;
  dialogData: LocationDetailDTO;
  locationDetail: LocationDetailDTO;
  location: Location;
  bookingId: string;
  hasMandatoryMetadata: boolean = false;
  user: ManagerUserData;
  toCreate: boolean;

  MetadataTypesEnum = MetadataTypes;

  textBtnCancel = 'main.cancel';
  textBtnOk = 'main.save';

  title = 'main.extra_information';

  constructor(
    private modalRef: ModalRef,
    private config: ModalConfig,
    private modalService: ModalService
  ) {
    let { valueModel, itemsModel, bookingId, location, hasMandatoryMetadata, toCreate } = this.config.data;
    this.valueModel = valueModel;
    this.itemsModel = itemsModel;
    this.bookingId = bookingId;
    this.location = location;
    this.hasMandatoryMetadata = hasMandatoryMetadata;
    this.toCreate = toCreate;

    if (this.toCreate && !this.hasMandatoryMetadata) {
      this.textBtnCancel = 'main.no';
      this.textBtnOk = 'main.yes';
      this.title = 'organization.add_extra_information';
    }
    this.processViewModel();
  }

  ngOnInit() {
  }

  processViewModel() {
    if (this.itemsModel?.length > 0) {
      this.itemsModel.forEach((item, i) => {
        let view = {} as IMetadataView;
        const valModel = this.valueModel.find(v => v.idMetadataItem === item.id);

        if ((this.isDropdown(item.type) || this.isCheckbox(item.type)) && item.defaultData?.length > 0) {
          const opts = item.defaultData.split(",");
          const valOpts = valModel?.method;
          view.options = [];
          opts.forEach(o => {
            view.options.push({
              id: o,
              value: o,
              selected: valOpts?.indexOf(o) > -1
            });
          });
        }

        view.id = valModel?.id;
        view.name = item.name;
        view.type = item.type;
        view.method = valModel?.method || this.getMethodDefaultValue(item.type, item.defaultData);
        view.description = valModel?.description || '';
        view.idMetadataItem = item.id;
        view.metadataItem = item;

        this.viewModel.push(view);
      });
    }
  }

  getMethodDefaultValue(type: MetadataTypes, d: string) {
    if (type === MetadataTypes.Dropdown)
      return null;
    return d;
  }

  isGeodata(type: MetadataTypes) {
    return type === MetadataTypes.Geodata;
  }

  isFreeText(type: MetadataTypes) {
    return type === MetadataTypes.FreeText;
  }

  isDropdown(type: MetadataTypes) {
    return type === MetadataTypes.Dropdown;
  }

  isCheckbox(type: MetadataTypes) {
    return type === MetadataTypes.Checkbox;
  }

  validateDescription(value: string, i: number) {
    this.viewModel[i].isValidDescription = this.isValidDesc(i);
  }

  isValidDesc(i: number) {
    const item = this.viewModel[i];
    item.isValidDescription = !isEmpty(item.description);
    return item.isValidDescription;
  }

  validateMethod($event: any, i: number) {
    this.viewModel[i].isValidMethod = this.isValidMethod(i);
  }

  isValidMethod(i: number) {
    const item = this.viewModel[i];
    if (item.type == MetadataTypes.FreeText)
      item.isValidMethod = !this.itemsModel[i].isMandatory || !isEmpty(item.method);
    else if (item.type === MetadataTypes.Dropdown)
      item.isValidMethod = !this.itemsModel[i].isMandatory || !isEmpty(item.method);
    else if (item.type === MetadataTypes.Checkbox)
      item.isValidMethod = !this.itemsModel[i].isMandatory || item.options.filter(f => f.selected)?.length > 0;
    else if (item.type === MetadataTypes.Geodata)
      item.isValidMethod = (item.method != null) && (!this.itemsModel[i].isMandatory || !isEmpty(item.method));

    return item.isValidMethod;
  }

  get isValidModel() {
    let validArr: boolean[] = [];
    this.viewModel.forEach((item, i) => {
      validArr.push(this.isValidMethod(i));
    });
    return validArr.filter(f => !Boolean(f))?.length === 0;
  }

  openModalGoogleMapSearchBox(index: number) {
    let geodata = null;

    try {
      geodata = JSON.parse(this.viewModel[index].method);
    } catch { };

    const modalRef = this.modalService.open(ModalSearchGooglemapLocationComponent, {
      width: '80%',
      height: '450px',
      data: { lat: geodata?.lat, lng: geodata?.lng },
      customClass: 'modal-search-googlemap-location'
    });

    modalRef.afterClosed$.subscribe(res => {
      if (res) {
        this.viewModel[index].method = JSON.stringify(res);
        this.validateMethod(null, index);
      }
    })
  }

  submitForm(withoutMetadata: boolean, $event: any) {
    $event.preventDefault();
    $event.stopPropagation();
    this.submitted = true;
    let data: IMetadataValue[] = [];

    if (!withoutMetadata) {
      if (!this.isValidModel)
        return;

      this.viewModel.forEach(v => {
        let d = { ...v } as unknown as IMetadataValue;
        if (this.isCheckbox(v.type)) {
          d.method = v.options.filter(f => f.selected).map(m => m.value).join(",");
        }
        d.description = v.description;
        d.idMetadataItem = v.idMetadataItem;
        d.idBooking = this.bookingId;
        data.push(d);
      });
    }

    this.modalRef.close(data);

  }

  cancel($event: any) {
    $event.preventDefault();
    $event.stopPropagation();
    const res = this.hasMandatoryMetadata ? null : false;
    this.modalRef.close(res);
  }

}
