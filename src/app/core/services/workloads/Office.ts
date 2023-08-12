import { OfficeType } from "./enums";
import { MeetingRoomCoordinate } from "./meeting";
import { Seat } from "./Seat";

export class Office {
  id: string;
  name: string;
  allowedLoad: number = 0;
  actualLoad: number = 0;
  currentLoad: number = 0;
  capacity: number = 0;
  imageUrl: string;
  orderInList: number;
  equipments: string[] = [];
  equipmentsInline: string = '';
  location: string = '';
  contextualPicture: string = '';
  archivedDate?: Date;
  restoredDate?: Date;
  msUniqueId: string = '';
  googleUniqueId: string = '';
  archived: boolean = false;
  type: OfficeType = OfficeType.Normal;
  seats: Seat[] = [];
  idFloor: string;
  coordinate?: MeetingRoomCoordinate;
  isDeskBookingEnabledOnFloor?: boolean;
}
