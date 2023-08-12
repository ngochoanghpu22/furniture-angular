export class AddEditWorkingPolicyDTO {
  id: string;
  name: string;
  companyId: string;
  isLimitRemoteDaysPerWeekEnabled: boolean;
  maxNumberOfRemoteDaysPerWeek: number;
  isLimitRemoteDaysPerMonthEnabled: boolean;
  maxNumberOfRemoteDaysPerMonth: number;
  isLimitOfficeDaysPerWeekEnabled: boolean;
  maxNumberOfOfficeDaysPerWeek: number;
  isAllowRemoteExceptionEnabled: boolean;
  remoteExceptionContactId: string | null;
  contactId: string | null;
  numberOfUsers: number | null;
}