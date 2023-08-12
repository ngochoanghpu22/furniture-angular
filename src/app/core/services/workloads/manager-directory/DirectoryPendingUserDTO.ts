
export interface DirectoryPendingUserDTO {
  id: string;
  fullName: string;
  name: string;
  avatar: string;
  firstName: string;
  lastName: string;
  email: string;
  coreTeam: string;
  invitedDate: string;
  inviterFullName: string;
  isOnboarded: boolean;

  roleSerialized: string;
  workingPolicyId: string | null;
  coreTeamId?: string;

}