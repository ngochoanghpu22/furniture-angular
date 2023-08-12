import { LogCriticity } from './enums';

export class JobLogs {
  public id: string;
  public part: string;
  public subPart: string;
  public criticity: LogCriticity;
  public comment: string;
  public date: Date;
}
