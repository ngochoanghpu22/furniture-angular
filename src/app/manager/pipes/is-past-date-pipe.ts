import { DateTime } from 'luxon';
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'isPastDatePipe' })
export class IsPastDatePipe implements PipeTransform {
  transform(dayDate: string): boolean {
    const iso = DateTime.fromISO(dayDate);
    return iso.startOf('day') < DateTime.now().startOf('day');
  }
}
