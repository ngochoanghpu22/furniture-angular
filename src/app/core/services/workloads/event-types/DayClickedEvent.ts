import { Day } from "../Day"
import { Week } from "../Week"

export type DayClickedEvent = {
  day: Day[],
  week: Week,
  event: Event
}
