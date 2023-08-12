export interface UpdatePreferedWeekDto {
  userId: string;
  dayIndex: number;
  locationId: string;
  workingPolicyId?:string;
}