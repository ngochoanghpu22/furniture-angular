import { Office } from "../Office";

export type OfficeClickedEvent = {
  office: Office,
  timeslotId: string;
  modeHalfDay: boolean;
  doLeave: boolean;
}