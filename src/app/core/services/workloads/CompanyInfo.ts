import { WorkingStatus } from "./WorkingStatus";

export class CompanyInfo {
  public organizationName: string = "";
  public approvedDomains: string[] = [];
  public statuses: WorkingStatus[] = [];
}
