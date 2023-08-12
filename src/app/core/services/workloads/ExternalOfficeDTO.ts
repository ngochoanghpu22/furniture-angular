import { AuthProvider } from "./enums";

export class ExternalOfficeDTO {
  displayName: string;
  uniqueId: string;
  authProvider: AuthProvider;
}

export interface LinkToExternalOfficeRequest {
  officeId: string;
  uniqueId: string;
  displayName: string;
  toRemoveLink: boolean;
  authProvider: AuthProvider;
}