import { IMetadataValue } from "../metadata-modals";

export interface BookSeatRequest {
  seatId: string;
  userId: string;
  date: Date;
  timeslotId: string;
  modeHalfDay: boolean;
  metadataValues?: IMetadataValue[];
}

export interface BookSeatDTO {
  selectedRemoteLocation: string;
  selectedRemoteLocationId: string;
  selectedRemoteLocationAddress: string;
  selectedRemoteSeatId: string | null;
  selectedRemoteSeatIndex: number | null;
  selectedRemoteSeatName: string;
  inOffice: boolean;
  isConfirmed: boolean;
  color: string;
  isRemoteWork: boolean;
  orderInList: number;
  hierarchyLevel: string;
  timeslotId: string | null;
  metadataValues: IMetadataValue[];
}