export class Workload<T> {

  public errorCode: string = "";
  public errorMessage: string = "";
  public workload!: T;
  statusCode: number;
}