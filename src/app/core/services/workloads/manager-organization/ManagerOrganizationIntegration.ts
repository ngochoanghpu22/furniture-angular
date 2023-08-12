import { ConfigurationType, OrganizationType } from "../enums";

export class ManagerOrganizationIntegration {
  public id?: string;
  public name?: string;
  public icon?: string;
  public isLocked?: boolean;
  public type?: OrganizationType;
  public isActive: boolean;
  public configurationType: ConfigurationType | null;
}
