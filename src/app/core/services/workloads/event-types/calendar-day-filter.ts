import { DateTime } from "luxon"

export type CalendarDayFilter = {
  date: DateTime,
  label: string,
  isToday: boolean
}