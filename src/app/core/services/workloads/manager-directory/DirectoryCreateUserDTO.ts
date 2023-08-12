import { UserRole } from "../enums";

export interface DirectoryCreateUserDTO {
  id: string | null;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  coreTeamId: string | null;
  workingPolicyId: string | null;
  oldEmail: string;
  isInvitedByEmail: boolean | null;
}
