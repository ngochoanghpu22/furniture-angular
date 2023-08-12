import { DateTime } from "luxon";
import { MeetingDetailDTO } from "./meeting-detail-dto";

export class CreateMeetingDTO {
  name: string;
  officeId: string;
  userIds?: string[];
  teamIds?: string[];
  organizerId: string;
  startDate: string;
  endDate: string;
  externalEmails?: string[];

  constructor(detail: MeetingDetailDTO) {
    this.name = detail.name;
    this.officeId = detail.officeId;
    this.organizerId = detail.organizerId;
    this.startDate = DateTime.fromJSDate(detail.startDate).toISO();
    this.endDate = DateTime.fromJSDate(detail.endDate).toISO();
    this.userIds = detail.users.filter(x => !x.isExternalEmail).map(x => x.id);
    this.externalEmails = detail.users.filter(x => x.isExternalEmail).map(x => x.fullName);
    this.teamIds = [];
  }
}