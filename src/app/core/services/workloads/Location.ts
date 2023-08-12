import { HierarchyLevel } from "./enums";
import { MetadataTemplate } from "./MetadataTemplate";

export class Location {
  public id: string = "";
  public name: string = "";
  public address: string = "";
  public orderInList: number = 0;
  public color: string = null;
  public hierarchyLevel: HierarchyLevel | null = null;
  public inOffice: boolean = false;
  public isConfirmed: boolean = false;
  public isRemoteWork: boolean = false;
  public children: Location[] = [];
  public metadataTemplate: MetadataTemplate | null = null;
  public actualLoad: number[] = [];
  public maxPlaceAvailable: number = 0;
  public maxPerson: number = 0;
  public maxSeatNumber: number = null;
  public archived: boolean = false;
  public paddingLeft: number = 0;
  public idParentLocation: string = '';
  public seatArchitectureId: string = '';
  public consolidatedActualLoad?: number[] = [];

}

export const Location_Non_Defined_Name = 'question';
export const Location_InOffice_Name = 'building';
