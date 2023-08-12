import { DateTime } from "luxon";
import { Day } from "../Day";
import { LocationChangedTrigger } from "../enums";
import { Location } from "../Location";
import { IMetadataValue } from "../metadata-modals";
import { SeatBookedEvent } from "./seat-booked-event";

export type LocationChangedEvent = {
  teamId?: string,
  userId: string,
  date: DateTime,
  location: Location,
  metadataValues: IMetadataValue[] | null
} & SeatBookedEvent;

export type LocationInfoEvent = {
  locations: LocationChangedEvent[],
  dayInfos?: Day[];
  timeslotIndex: number;
}

export type LocationChangedEventWithTrigger = {
  trigger: LocationChangedTrigger,
  modeHalfDay: boolean;
  events: LocationChangedEvent[]
}

export type SeatInfoEvent = {
  dayIndex: number;
  timeslotIndex: number;
}