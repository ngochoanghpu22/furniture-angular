import { BaseStatsDto, StatViewTypes, Location, LocationStatsItemDto } from "@flex-team/core";
import { ChartDataset } from "chart.js";
import { DateTime } from "luxon";
import { InternalChartData } from "../internal-chart-data";

export abstract class BaseChartDataBuilder<T> {

    public selectedDate: DateTime;

    public getChartData(data: BaseStatsDto<T>[], viewType: StatViewTypes): InternalChartData {
        const isMonthly = [
            StatViewTypes.MonthlyOfficesOccupancyRate,
            StatViewTypes.MonthlyWorkforceDistribution,
            StatViewTypes.MonthlyPersonalLogins].indexOf(viewType) >= 0;

        if (isMonthly)
            return this.getMonthly(data);
        else
            return this.getDaily(data);
    }

    protected factoryTooltipDetailForLocation(loc: LocationStatsItemDto, total: number): string {
        return `${loc.address} - ${this.getPercentageLabel(loc.actualLoad[0], total)}`;
    }

    protected getPercentageLabel(nb: number, total: number): string {
        const percentage = !total ? 0 : Math.round(nb / total * 100);
        return `${percentage}% (${nb}/${total})`;
    }

    protected factoryBar(data: any[], label: string, color?: string): ChartDataset {
        return <ChartDataset>{
            data: data,
            label: label,
            barThickness: 20,
            backgroundColor: color,
            hoverBackgroundColor: color,
            borderColor: color,
            stack: 'a'
        }
    }

    protected getColorByLocation(name: string): string {
        switch (name) {
            case "home": return "#fdb1cd";
            case "building": return "#97deea";
            case "absent": return "#f55b1d";
            case "car": return "#ffef33";
            default: return "rgba(0, 0, 0, 0.4)";
        }
    }

    /**
   * Get number of week day in a given month/year
   * Get the day of the week. 1 is Monday and 7 is Sunday
   * @param month 
   * @param year 
   * @param weekday 
   */
    protected getNumberOfWeekdayInMonth(month: number, year: number, weekday: number): number {
        let iter = DateTime.utc(year, month, 1);
        let i = 0;
        while (iter.month == month) {
            if (iter.weekday == weekday) {
                i++;
            }
            iter = iter.plus({ days: 1 });
        }
        return i;
    }

    abstract getMonthly(data: BaseStatsDto<T>[]): InternalChartData;
    abstract getDaily(data: BaseStatsDto<T>[]): InternalChartData;
}
