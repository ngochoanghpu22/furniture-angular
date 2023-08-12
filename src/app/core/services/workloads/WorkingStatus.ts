import { HierarchyLevel } from "./enums";

export class WorkingStatus {
  public id: string;
  public name: string;
  public address: string;
  public inOffice: boolean;
  public isRemoteWork: boolean;
  public archived: boolean;
  public isDeletable: boolean;
  public isIconChangable: boolean;
  public orderInList: number;
  public hierarchyLevel: HierarchyLevel | null = null;
  public color: string;
}
