import { OccupationRecurrence, OccupationType } from "../enums";
import { OccupationRuleItem } from "./OccupationRuleItem";

export interface OccupationRule {
  id: string;
  type: OccupationType;
  recurrence: OccupationRecurrence;
  date: Date;
  dayOfWeek: number;
  numberWeeks: number;
  items: OccupationRuleItem[]
}