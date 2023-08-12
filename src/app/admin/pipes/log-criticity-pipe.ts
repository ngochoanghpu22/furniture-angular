import { Pipe, PipeTransform } from '@angular/core';
import { LogCriticity } from '@flex-team/core';

@Pipe({ name: 'logCriticityPipe' })
export class LogCriticityPipe implements PipeTransform {
  transform(value: LogCriticity): string {
    return LogCriticity[value];
  }
}
