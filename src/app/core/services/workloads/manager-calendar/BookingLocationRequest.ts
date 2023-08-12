import { LocationDetailDTO } from "./location-detail-dto";

export interface BookingLocationRequest {
  date: Date;
  locations: LocationDetailDTO[];
  userId: string;
  modeHalfDay: boolean;
  dayIndex?: number;
}