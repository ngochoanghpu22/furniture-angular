import { HierarchyLevel } from "../enums";

export interface MeetingSearchUserDTO {
  id: string;
  name: string;
  email: string;
  image: string;
  selectedRemoteLocation: string;
  hierarchyLevel: HierarchyLevel;
  orderInList: number;
  color: String;
  nameEmail: string
}