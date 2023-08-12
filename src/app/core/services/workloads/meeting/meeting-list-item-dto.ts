export interface MeetingListItemDTO {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  organizerId: string;
  nbUsers?: number;
}