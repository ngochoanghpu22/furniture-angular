export class TimeSlotTemplateDTO {
  id: string;
  name: string;
  companyId: string;
  dayOfWeek: number;
  startHour: number;
  startMinutes: number;
  stopHour: number;
  stopMinutes: number;
  gmt?: number;
}
