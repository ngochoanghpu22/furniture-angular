import { OccupationRuleItem } from "../manager-office";

export interface OccupationBuildingDTO {
  id: string;
  floors: OccupationFloorDTO[];
}

export interface OccupationFloorDTO {
  id: string;
  offices: OccupationOfficeDTO[];
}

export interface OccupationOfficeDTO {
  id: string;
  name: string;
  block: OccupationOfficeState;
  reserve: OccupationOfficeState;
}

export interface OccupationOfficeState {
  users: OccupationRuleItem[];
  teams: OccupationRuleItem[];
  allUserIds: string[];
}