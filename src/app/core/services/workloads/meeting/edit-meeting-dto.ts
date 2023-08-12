import { DateTime } from "luxon";
import { MeetingDetailDTO } from "./meeting-detail-dto";

export class EditMeetingDTO {
  id: string;
  name: string;
  userIds: string[];
  teamIds: string[];
  startDate: string;
  endDate: string;
  externalEmails?: string[];

  constructor(detail: MeetingDetailDTO) {
    this.id = detail.id;
    this.name = detail.name;
    this.startDate = DateTime.fromJSDate(detail.startDate).toISO();
    this.endDate = DateTime.fromJSDate(detail.endDate).toISO();
    this.userIds = detail.users.filter(x => !x.isExternalEmail).map(x => x.id);
    this.externalEmails = detail.users.filter(x => x.isExternalEmail).map(x => x.fullName);
    this.teamIds = [];
  }
}