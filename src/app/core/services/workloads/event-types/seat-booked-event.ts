import { Seat } from "../Seat";

export type SeatBookedEvent = {
  seat: Seat,
  timeslotId: string;
  userId?: string;
  doLeave: boolean;
  modeHalfDay: boolean;
}