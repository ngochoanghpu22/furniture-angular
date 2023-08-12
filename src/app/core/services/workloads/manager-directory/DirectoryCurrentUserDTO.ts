export interface DirectoryCurrentUserDTO {
  id: string;
  fullName: string;
  name: string;
  avatar: string;
  firstName: string;
  lastName: string;
  email: string;
  coreTeam: string;
  roleSerialized: string;
  remoteProfileName: string;
  tinyPicture: string;
  integrationSSO: string;
  isSyncSlack: boolean;
  firstLogin?: Date;
  lastLogin?: Date;

  workingPolicyId?: string;
  coreTeamId?: string;
  isOnboarded: boolean;
}