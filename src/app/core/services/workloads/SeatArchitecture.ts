import { Seat } from "./Seat";

export interface SeatArchitecture {
  id: string;
  base64Image?: string;
  seats: Seat[];
}