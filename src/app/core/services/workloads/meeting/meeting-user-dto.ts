import { HierarchyLevel } from "../enums";

export interface MeetingUserDTO {
  id: string;
  fullName: string;
  image: string;
  selectedRemoteLocation: string;
  hierarchyLevel: HierarchyLevel;
  orderInList: number;
  color: string;
  isExternalEmail: boolean;
}