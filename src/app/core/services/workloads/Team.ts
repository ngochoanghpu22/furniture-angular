import { User } from './User';

export class Team {
  public id: string = "";
  public name: string = "";
  public idOwner: string = "";
  public description: string = "";
  public isHierarchy: boolean;
  public isPrefered: boolean;
  public isSocial: boolean;
  public noticePeriod: number;
  public isSunMandatory: boolean;
  public isMonMandatory: boolean;
  public isTueMandatory: boolean;
  public isWedMandatory: boolean;
  public isThurMandatory: boolean;
  public isFriMandatory: boolean;
  public isSatMandatory: boolean;

  public userToInclude: string = "";
  public visibility?: TeamVisibilityEnum;

  public users: User[] = [];

  public owner: User = new User();

}

export enum TeamVisibilityEnum {
  Private = 'private',
  Public = 'public',
}
