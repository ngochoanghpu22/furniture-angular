import { ChartData } from "chart.js";

export interface InternalChartData extends ChartData {
    tooltipTitles?: string[][];
    tooltipAfterLabels?: string[][];
    tooltipLabels?: string[][];
}