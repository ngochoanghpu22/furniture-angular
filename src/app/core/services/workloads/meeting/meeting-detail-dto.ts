import { MeetingOrganizerDTO } from "./meeting-organizer-dto";
import { MeetingUserDTO } from "./meeting-user-dto";

export class MeetingDetailDTO {
  id: string;
  name: string;
  officeId: string;
  organizerId: string;
  organizer: MeetingOrganizerDTO;
  users: MeetingUserDTO[] = [];
  startDate: Date;
  endDate: Date;
  isExternalEmail: boolean;
}