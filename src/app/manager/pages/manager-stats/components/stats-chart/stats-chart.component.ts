import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { StaticDataService } from '@flex-team/core';
import { Chart, ChartOptions, ChartType, Color, Plugin, TooltipItem } from 'chart.js';
import { DateTime } from 'luxon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartTools, InternalChartData } from '../../tools';


@Component({
  selector: 'fxt-stats-chart',
  templateUrl: './stats-chart.component.html',
  styleUrls: ['./stats-chart.component.scss']
})
export class StatsChartComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  @Input() chartData: InternalChartData;

  @Input() isDaily = false;
  @Input() forWorkforce = false;
  @Input() forPersonalLogin = false;
  @Input() periodText: string;
  @Input() targetDate: DateTime;

  public tooltipCallbacks: any = {
    title: (item: TooltipItem<any>[]) => {
      const title = !this.isDaily ? `${item[0].label} ${this.periodText}` : item[0].label;
      return title;
    },
    label: (item: TooltipItem<any>) => {
      return this.chartData.tooltipLabels[item.datasetIndex][item.dataIndex];
    },
    afterLabel: (item: TooltipItem<any>) => {
      return this.chartData.tooltipAfterLabels
        ? this.chartData.tooltipAfterLabels[item.datasetIndex][item.dataIndex]
        : null;
    },
  }

  public chartOptions: ChartOptions;
  public chartLabels: any[] = [];
  public chartType: ChartType = 'bar';
  public chartLegend = true;
  public chartPlugins: any[] = [];
  public chartColors: Color[] = [];
  public plugins: Plugin[] = [{
    id: 'custom_canvas_background_color',
    beforeDraw: (chart: Chart) => {
      const diffMonths = this.targetDate?.startOf("month")?.diff(DateTime.now().startOf("month"), 'months').toObject().months
      if (this.isDaily || diffMonths < 0) {
        return;
      }
      const ctx = chart.ctx;
      const chartArea = chart.chartArea;
      ctx.save();
      ctx.fillStyle = '#D9D9D9';
      let startPoint = chartArea.left;
      let widthRect = chartArea.width;
      if (diffMonths === 0) {
        const currentDay = DateTime.now().day;
        const columnCount = chart.data.labels.length;
        const columnWidth = chartArea.width / columnCount;
        startPoint = chartArea.left + columnWidth * currentDay;
        widthRect = chartArea.right - startPoint;
      }
      ctx.fillRect(startPoint, chartArea.top, widthRect, chartArea.height);
      ctx.restore();
    }
  }]

  constructor(private staticDataService: StaticDataService) {
    this.chartOptions = ChartTools.factoryChartOptions();
    this.chartOptions.plugins.tooltip.callbacks = this.tooltipCallbacks;
  }

  ngAfterViewInit(): void {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.chartData && !changes.chartData.firstChange) {
      this.updateChart();
    }
  }


  private updateChart() {
    const nbDays = this.chartData.datasets[0].data.length;
    this.updateLabels(nbDays);
    this.updateColors();
  }

  private updateLabels(nbDays: number) {
    if (!this.isDaily) {
      const arr: string[] = [];
      for (let i = 1; i <= nbDays; i++) {
        arr.push(i.toString());
      }
      this.chartLabels = arr;
    } else {
      this.chartLabels = !this.forPersonalLogin
        ? this.staticDataService.getWorkingDays({ long: true })
        : this.staticDataService.getWorkingDays({ long: true, includeWeekend: true });
    }
  }

  private updateColors() {
    if (this.forWorkforce) {
      this.chartColors = this.chartData.datasets.map(x => <Color>x.backgroundColor);
    } else {
      this.chartColors = ChartTools.factoryPaletteColors();
    }
  }

}
