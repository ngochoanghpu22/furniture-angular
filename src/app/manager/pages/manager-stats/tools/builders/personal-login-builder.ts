import { EventNames, LoginStatsCounter, LoginStatsDto } from "@flex-team/core";
import { ChartDataset } from "chart.js";
import { InternalChartData } from "../internal-chart-data";
import { BaseChartDataBuilder } from "./base-chart-data-builder";

export class PersonalLoginBuilder extends BaseChartDataBuilder<LoginStatsCounter> {

    public getMonthly(data: LoginStatsDto[]): InternalChartData {
        const datasets: ChartDataset[] = [];
        const obj: any = {};
        const objLabel: any = {};
        const objTooltipLabel: any = {};

        data.forEach(dtoItem => {
            dtoItem.items.forEach(x => {
                if (!obj[x.name]) obj[x.name] = [];
                objLabel[x.name] = EventNames[x.name];

                obj[x.name].push(x.number);

                if (!objTooltipLabel[x.name]) objTooltipLabel[x.name] = [];
                objTooltipLabel[x.name].push(`${objLabel[x.name]} ${this.getPercentageLabel(x.number, dtoItem.total)}`);

            })
        });

        const tooltipLabels: string[][] = [];
        Object.keys(obj).forEach(key => {
            datasets.push(this.factoryBar(obj[key], objLabel[key]));
            tooltipLabels.push(objTooltipLabel[key]);
        });

        return <InternalChartData>{
            datasets,
            tooltipLabels,
        };
    }

    public getDaily(data: LoginStatsDto[]): InternalChartData {
        const datasets: ChartDataset[] = [];
        const objData: any = {};
        const objLabel: any = {};
        const objTotal: number[] = Array(7).fill(0);

        data.forEach(dtoItem => {
            dtoItem.items.forEach(x => {
                if (!objData[x.name]) objData[x.name] = Array(7).fill(0);
                objLabel[x.name] = EventNames[x.name];

                const dayOfWeek = dtoItem.dayOfWeek > 0 ? dtoItem.dayOfWeek : 8;
                objData[x.name][dayOfWeek - 1] += x.number;
                objTotal[dtoItem.dayOfWeek - 1] += x.number;
            })
        });

        const tooltipLabels: any[] = [];

        Object.keys(objData).forEach((key, index) => {
            datasets.push(this.factoryBar(objData[key], objLabel[key]));

            objData[key].forEach((nb: number, dayIndex: number) => {
                if (!tooltipLabels[index]) tooltipLabels[index] = [];
                const nbWeekday = this.getNumberOfWeekdayInMonth(this.selectedDate.month, this.selectedDate.year, dayIndex + 1);
                tooltipLabels[index].push(`${objLabel[key]} ${this.getPercentageLabel(nb / nbWeekday, objTotal[dayIndex] / nbWeekday)}`);
            });
        })

        return <InternalChartData>{
            datasets,
            tooltipLabels,
        };
    }
}