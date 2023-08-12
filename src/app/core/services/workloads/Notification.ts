import { NotificationLevel, NotificationType } from './enums';
import { User } from './User';

export class Notification {

  public id: string = "";
  public user: User = new User();
  public type: NotificationType = NotificationType.DayLeft;
  public payload: string = "";
  public actionContent: string = "";
  public dateGeneration: string = "";
  public dateClose: string = "";
  public placeholderNotification: boolean = false;
  public level: NotificationLevel = NotificationLevel.Info;

  public constructor(init?: Partial<Notification>) {
    Object.assign(this, init);
  }
}
