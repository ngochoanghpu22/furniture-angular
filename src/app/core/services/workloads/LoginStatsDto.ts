import { BaseStatsDto } from "./BaseStatsDto";
import { EventNames } from "./enums";

export interface LoginStatsDto extends BaseStatsDto<LoginStatsCounter> {
}

export interface LoginStatsCounter {
    name: EventNames;
    number: number;
}