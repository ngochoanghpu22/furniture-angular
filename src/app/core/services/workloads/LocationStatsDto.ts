import { BaseStatsDto } from './BaseStatsDto';
import { Location } from './Location';

export class LocationStatsDto extends BaseStatsDto<LocationStatsItemDto> {
}

export class LocationStatsItemDto {
  public id: string = "";
  public name: string = "";
  public color: string = "";
  public address: string = "";
  public inOffice: boolean = false;
  public children: LocationStatsItemDto[] = [];
  public maxPlaceAvailable: number = 0;
  public maxPerson: number = 0;
  public actualLoad: number[];

  constructor(loc: Location, dayIndex: number) {
    this.id = loc.id;
    this.address = loc.address;
    this.name = loc.name;
    this.color = loc.color;
    this.inOffice = loc.inOffice;
    this.maxPlaceAvailable = loc.maxPlaceAvailable;
    this.maxPerson = loc.maxPerson;

    let actualLoad = 0;
    Object.values(loc.actualLoad[dayIndex]).forEach((x:any) => actualLoad += x[0]);
    this.actualLoad = [actualLoad];

    this.children = [];
    loc.children.forEach(x => this.children.push(new LocationStatsItemDto(x, dayIndex)));
  }

}