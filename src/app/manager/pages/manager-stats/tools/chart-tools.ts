import { BaseStatsDto, ManagerStatFilter, StatViewTypes } from "@flex-team/core";
import { ChartOptions, Color, TooltipOptions, LegendOptions, Chart } from "chart.js";
import {
    BaseChartDataBuilder, OfficeOccupancyBuilder, PersonalLoginBuilder,
    WorkforceDistributionBuilder
} from "./builders";
import { InternalChartData } from "./internal-chart-data";

export class ChartTools {

    static factoryPaletteColors(): Color[] {

        const barChartColors: Color[] = [
            '#A6CEE3',
            '#FDB1CD',
            '#F55B1D',
            '#FFEF33',
            '#9F68AE',
            '#5C1CC8',
            '#8D5B74',
            '#8B3037',
            '#2CBFE9',
            '#4162DD',
        ]
        return barChartColors;
    }

    static factoryChartOptions(): ChartOptions {
        return <ChartOptions>{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: <TooltipOptions>{
                    backgroundColor: 'white',
                    titleColor: 'rgba(0, 0, 0, 0.8)',
                    bodyColor: 'rgba(0, 0, 0, 0.64)',
                    cornerRadius: 8,
                    boxPadding: 15,
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                    borderWidth: 1,
                    bodySpacing: 10,
                    position: 'average'
                },
                legend: <LegendOptions<any>>{
                    position: 'bottom'
                }
            },
        };
    }

    static factoryBuilder(viewType: StatViewTypes): BaseChartDataBuilder<any> {
        switch (viewType) {
            case StatViewTypes.MonthlyOfficesOccupancyRate:
            case StatViewTypes.DailyAverageOfficeOccupancy:
                return new OfficeOccupancyBuilder();

            case StatViewTypes.MonthlyWorkforceDistribution:
            case StatViewTypes.DailyAverageWorkforceDistribution:
                return new WorkforceDistributionBuilder();

            case StatViewTypes.MonthlyPersonalLogins:
            case StatViewTypes.DailyAveragePersonalLogins:
                return new PersonalLoginBuilder();
            default: return null;
        }
    }

    static factoryChartData(data: BaseStatsDto<any>[], filter: ManagerStatFilter): InternalChartData {
        const builder = this.factoryBuilder(filter.viewType);
        builder.selectedDate = filter.targetDate;
        return builder.getChartData(data, filter.viewType);
    }

}