import { User } from './User';
import { Location } from './Location';

export class InviteUser {
  public email: string = "";
  public fullName: string = "";
  public firstName: string = "";
  public lastName: string = "";

  public constructor(init?: Partial<InviteUser>) {
    Object.assign(this, init);
  }
}
