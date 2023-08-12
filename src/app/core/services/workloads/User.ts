import { ConfigurationDTO } from "./ConfigurationDTO";
import { AuthProvider } from "./enums";
import { TimeSlotTemplateDTO } from "./manager-organization";
import { Team } from "./Team";

export interface UserMetadata {
  address1: string;
  address2: string;
  address3: string;
  address4: string;
}

export class User {
  public email: string = '';
  public id: string = '';
  public idCompany: string = '';
  public companyName: string = '';
  public firstName: string = '';
  public name: string = '';
  public avatar: string = '';
  public lastName: string = '';
  public fullName: string = '';
  public metadata: UserMetadata;
  public smallPicture: string = '';
  public tinyPicture: string = '';
  public roleSerialized: string = '';
  public role: string = '';
  public teamsOf: string[] = [];
  public picture: string = '';
  public coreTeamName: string = '';
  public coreTeamMandatoryOffices: boolean[] = [];
  public configurations: ConfigurationDTO[] = [];
  public timeSlotTemplates: TimeSlotTemplateDTO[] = [];
  public isOnboarded: boolean = false;
  public slackMemberId: string = '';
  public authProvider: AuthProvider = AuthProvider.None;
  public workingPolicyId: string = '';
  public formatDate: string = '';
  public team: Team;


}
