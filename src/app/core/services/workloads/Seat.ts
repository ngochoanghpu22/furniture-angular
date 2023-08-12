import { Booking } from "./Booking";
import { Office } from "./Office";
import { User } from "./User";

export interface Seat {
  id: string;
  name: string;
  officeId: string;
  seatArchitectureId: string;
  index: number;
  xParam: number;
  yParam: number;
  equipments: string[];
  office: Office;
}

export interface UserSeat {
  user: User;
  locationId: string;
  seatId?: string;
  startHour: number;
  startMinutes: number;
  stopHour: number;
  stopMinutes: number;
  gmt?: number;
}
