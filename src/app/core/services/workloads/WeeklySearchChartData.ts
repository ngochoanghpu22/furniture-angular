export type WeeklySearchChartDataPayload = {
  name: string,
  value: number,
  orderInList: number,
  color: string,
  hidden?: boolean
};
export interface WeeklySearchChartData {
  total: number,
  payload: WeeklySearchChartDataPayload[];
}