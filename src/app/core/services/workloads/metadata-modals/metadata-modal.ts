import { MetadataTypes } from "../enums/metadata-type.enum";

export interface IMetadataTemplate {
  id: string;
  name: string;
  color: string;
  address: string;
  isRemoteWork: boolean;
  locationId: string;
  metadataItems: IMetadataItem[];
}

export interface IMetadataItem {
  id: string;
  name: string;
  type: MetadataTypes;
  selectedType: string;
  defaultData: string;
  idMetadataTemplate: string;
  isMandatory: boolean;
  showAnswerToEveryone: boolean;
}

export interface IMetadataValue {
  id: string;
  description: string;
  method: string;
  idMetadataItem: string;
  metadataItem: IMetadataItem;
  idBooking: string;
}

export interface IMetadataView {
  id: string;
  name: string;
  type: MetadataTypes;
  method: string;
  description: string;
  options: { id: string; value: string; selected: boolean }[];
  selected: boolean;
  idMetadataItem: string;
  metadataItem: IMetadataItem;
  isValidMethod: boolean;
  isValidDescription: boolean;
}
