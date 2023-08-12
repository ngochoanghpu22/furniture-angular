import { OccupationRecurrence, OccupationType, SelectionType } from "../enums";

export interface OccupationRuleItem {
  id: string;
  linkedUserOrTeamId?: string;
  occupationRuleId: string;
  occupationType: OccupationType;
  occupationRecurrence: OccupationRecurrence;
  type: SelectionType;
  name: string;
  date: Date;
}