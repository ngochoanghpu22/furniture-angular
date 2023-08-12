import { User } from './User';
import { Location } from './Location';
import { InviteUser } from './InviteUser';
import { AuthProvider } from './enums';

export class Onboarding {
  public id: string = '';
  public team: string = '';
  public manager: string = '';
  public hierarchyTeamName: string = '';

  public monday: Location = new Location();
  public tuesday: Location = new Location();
  public wednesday: Location = new Location();
  public thursday: Location = new Location();
  public friday: Location = new Location();

  public inviteUsers: InviteUser[] = [];

  public owner: User = new User();
  public done: boolean = false;
  public urlToken: string = '';
  public skipHierarchyConfig: boolean = false;

  public skipFavoriteConfig: boolean = false;

}
