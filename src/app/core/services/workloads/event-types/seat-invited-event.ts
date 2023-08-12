import { IMetadataValue } from "../metadata-modals";
import { Office } from "../Office";
import { Seat } from "../Seat";

export type SeatInvitedEvent = {
  email: string,
  seat: Seat,
  office: Office,
  timeslotIndex: number,
  targetDate: Date;
  metadataValues: IMetadataValue[] | null
}