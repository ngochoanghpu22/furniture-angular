
export interface CheckIfCanChangeLocationDTO {
  canBook: boolean;
  errorCode: string;
  managerName?: string;
  policyName?: string;
  changedByManager?: boolean;
  teamName?: string;
  dayName?:string;
}