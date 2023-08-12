import { Location, LocationStatsDto, LocationStatsItemDto } from "@flex-team/core";
import { ChartDataset } from "chart.js";
import { InternalChartData } from "../internal-chart-data";
import { BaseChartDataBuilder } from "./base-chart-data-builder";

const Single_Tab_Space: string = '\t\t\t\t';
const Double_Tab_Space: string = '\t\t\t\t\t\t\t\t';

export class OfficeOccupancyBuilder extends BaseChartDataBuilder<Location> {

    public getMonthly(data: LocationStatsDto[]): InternalChartData {

        const datasets: ChartDataset[] = [];

        const objData: any = {};
        const objLabel: any = {};

        const objTooltipLabel: any = {};
        const objTooltipAfterLabel: any = {};

        data.forEach((dtoItem: LocationStatsDto) => {
            const inOfficeLocation = dtoItem.items.find(x => x.inOffice)
            inOfficeLocation.children.forEach(building => {
                if (!objData[building.id]) objData[building.id] = [];
                if (!objTooltipLabel[building.id]) objTooltipLabel[building.id] = [];
                if (!objTooltipAfterLabel[building.id]) objTooltipAfterLabel[building.id] = [];

                objData[building.id].push(building.actualLoad[0]);
                objLabel[building.id] = building.address;

                objTooltipLabel[building.id].push(this.factoryTooltipLabelForBuilding(building, building.maxPerson));
                objTooltipAfterLabel[building.id].push(this.factoryTooltipAfterLabelForBuilding(building));

            })
        });

        const tooltipLabels: string[][] = [];
        const tooltipAfterLabels: string[][] = [];
        const tooltipTitles: string[][] = [];
        Object.keys(objData).forEach(key => {
            datasets.push(this.factoryBar(objData[key], objLabel[key]));
            tooltipLabels.push(objTooltipLabel[key]);
            tooltipAfterLabels.push(objTooltipAfterLabel[key]);
        });

        return <InternalChartData>{
            datasets,
            tooltipLabels,
            tooltipAfterLabels,
            tooltipTitles
        }
    }


    public getDaily(data: LocationStatsDto[]): InternalChartData {
        const objData: any = {};
        const objLabel: any = {};

        const objTotal: number[] = Array(7).fill(0);
        const objTooltipAfterLabel: any = {};

        data.forEach(dtoItem => {
            const inOfficeLocation = dtoItem.items.find(x => x.inOffice);
            inOfficeLocation.children.forEach(building => {
                if (!objData[building.id]) objData[building.id] = Array(7).fill(0);

                objLabel[building.id] = building.address;

                if (dtoItem.dayOfWeek > 0 && dtoItem.dayOfWeek < 6) {
                    objData[building.id][dtoItem.dayOfWeek - 1] += building.actualLoad[0];
                    objTotal[dtoItem.dayOfWeek - 1] += building.actualLoad[0];
                }

                if (!objTooltipAfterLabel[building.id]) objTooltipAfterLabel[building.id] = [];
                objTooltipAfterLabel[building.id].push(this.factoryTooltipAfterLabelForBuilding(building));
            })
        });

        const datasets: ChartDataset[] = [];

        const tooltipLabels: any[] = [];

        Object.keys(objData).forEach((key, index) => {
            datasets.push(this.factoryBar(objData[key], objLabel[key]));

            objData[key].forEach((nb: number, dayIndex: number) => {
                if (!tooltipLabels[index]) tooltipLabels[index] = [];
                const nbWeekday = this.getNumberOfWeekdayInMonth(this.selectedDate.month, this.selectedDate.year, dayIndex + 1);
                tooltipLabels[index].push(`${objLabel[key]} - ${this.getPercentageLabel(nb / nbWeekday, objTotal[dayIndex]/nbWeekday)}`);
            });
        })

        return <InternalChartData>{
            datasets,
            tooltipLabels,
        };
    }

    private factoryTooltipAfterLabelForBuilding(building: LocationStatsItemDto): string[] {
        const list: string[] = [];

        building.children.forEach(floor => {
            list.push(Single_Tab_Space + this.factoryTooltipDetailForLocation(floor, floor.maxPerson));
            floor.children.forEach(office => {
                list.push(Double_Tab_Space + this.factoryTooltipDetailForLocation(office, office.maxPerson));
            })
        })

        return list;
    }

    private factoryTooltipLabelForBuilding(building: LocationStatsItemDto, total: number): string {
        return this.factoryTooltipDetailForLocation(building, total);
    }


}
