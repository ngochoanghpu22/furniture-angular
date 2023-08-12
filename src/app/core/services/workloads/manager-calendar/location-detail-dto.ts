import { IMetadataValue } from "../metadata-modals";

export interface LocationDetailDTO {
  target: string;
  targetLocation: any;
  seatId?: string;
  doLeave?: boolean;
  metadataValues?: IMetadataValue[];
  timeslotId: string;
}
 