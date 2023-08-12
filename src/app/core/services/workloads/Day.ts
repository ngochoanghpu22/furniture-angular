import { HierarchyLevel } from "./enums";
import { IMetadataValue } from "./metadata-modals";

export class Day {
  public dayDate: string = '';
  public selectedRemoteLocation: string = "";
  public selectedRemoteLocationId: string = "";
  public selectedRemoteLocationAddress: string = "";
  public selectedRemoteSeatId: string = "";
  public selectedRemoteSeatIndex: number = null;
  public selectedRemoteSeatName: string = "";
  public dayOfMonth: number = 0;
  public occupancyRate: number = 0;
  public isOutOfMonth: boolean = false;
  public isToday: boolean = false;
  public isConfirmed: boolean = false;
  public inOffice: boolean = false;
  public isRemoteWork: boolean = false;
  public orderInList: number = 0;
  public color: string = null;
  public hierarchyLevel: HierarchyLevel | null = null;
  public metadataValues: IMetadataValue[];
  public bookingId?: string;
  public selectedTimeslotId?: string;
}
