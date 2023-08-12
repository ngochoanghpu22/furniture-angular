export class BaseStatsDto<T> {
    date: Date;
    dayOfWeek: number;
    total: number;
    items: T[]
}
