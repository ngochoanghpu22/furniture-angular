import { User } from './User';
import { Location } from './Location';

export class Booking {
  public id: string = "";
  public user: User = new User();
  public location: Location = new Location();
  public dateTarget: Date = new Date();
}
