import { DateTime } from "luxon";
import { StatViewTypes } from "./enums";

export interface ManagerStatFilter {
    viewType: StatViewTypes;
    targetDate: DateTime;
}