import { Location, LocationStatsDto } from "@flex-team/core";
import { ChartDataset } from "chart.js";
import { InternalChartData } from "../internal-chart-data";
import { BaseChartDataBuilder } from "./base-chart-data-builder";

const Undefined_Location_Color = '#c4c4c4';

export class WorkforceDistributionBuilder extends BaseChartDataBuilder<Location> {

	public getMonthly(data: LocationStatsDto[]): InternalChartData {
		const datasets: ChartDataset[] = [];
		const obj: any = {};
		const objLabel: any = {};
		const objName: any = {};
		const objColor: any = {};

		const objTooltipLabel: any = {};
		const objTooltipAfterLabel: any = {};

		data.forEach(dtoItem => {
			dtoItem.items.forEach(loc => {
				if (!obj[loc.id]) obj[loc.id] = [];
				objLabel[loc.id] = loc.address;
				objName[loc.id] = loc.name;
				objColor[loc.id] = loc.color || Undefined_Location_Color;

				if (!objTooltipLabel[loc.id]) objTooltipLabel[loc.id] = [];
				objTooltipLabel[loc.id].push(this.factoryTooltipDetailForLocation(loc, dtoItem.total));

				obj[loc.id].push(loc.actualLoad[0]);

			})
		});

		const tooltipLabels: string[][] = [];
		Object.keys(obj).forEach(key => {
			datasets.push(this.factoryBar(obj[key], objLabel[key], objColor[key]));
			tooltipLabels.push(objTooltipLabel[key]);
		});

		return <InternalChartData>{
			datasets,
			tooltipLabels,
		};
	}
	public getDaily(data: LocationStatsDto[]): InternalChartData {
		const objData: any = {};
		const objLabel: any = {};
		const objName: any = {};
		const objColor: any = {};
		const objTotal: number[] = Array(7).fill(0);

		data.forEach(dtoItem => {
			dtoItem.items.forEach(loc => {
				if (!objData[loc.id]) objData[loc.id] = Array(7).fill(0);
				objLabel[loc.id] = loc.address;
				objName[loc.id] = loc.name;
				objColor[loc.id] = loc.color || Undefined_Location_Color;

				if (dtoItem.dayOfWeek > 0 && dtoItem.dayOfWeek < 6) {
					objData[loc.id][dtoItem.dayOfWeek - 1] += loc.actualLoad[0];
					objTotal[dtoItem.dayOfWeek - 1] += loc.actualLoad[0];
				}
			})
		});

		const datasets: ChartDataset[] = [];
		const tooltipLabels: any[] = [];

		Object.keys(objData).forEach((key, index) => {
			datasets.push(this.factoryBar(objData[key], objLabel[key], objColor[key]));

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
