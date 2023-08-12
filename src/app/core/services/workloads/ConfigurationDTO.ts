import { ConfigurationType } from "./enums";

export class ConfigurationDTO {
  public type: ConfigurationType | undefined;
  public value: string = "";
}
