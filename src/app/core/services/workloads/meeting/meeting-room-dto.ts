export interface MeetingRoomDTO {
  id: string;
  equipments?: string[];
  name: string;
  capacity?: number;
  coordinate: MeetingRoomCoordinate;
  contextualPicture?: string;
  msUniqueId?: string;
  googleUniqueId?: string;
}

export interface MeetingRoomCoordinate {
  xParam: number;
  yParam: number;
}