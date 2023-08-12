import { BookingLocationRules } from "../enums";

export interface BookingLocationResponse {
  rule: BookingLocationRules;
  canBook: boolean;
  canBookWithException: boolean;
  bookedByManager: boolean;
  bookedForHimself: boolean;
  policyName: string;
  managerName: string;
}