import { Building } from "./Building";
import { Floor } from "./Floor";
import { Location } from "./Location";
import { Office } from "./Office";

export interface CheckDataConsistencyDTO {
  checkDate: Date;
  hasErrorLinkFloorSeatArchitecture: boolean;
  undefinedLocationOnBoardingStates: CheckUndefinedLocationDTO[]
  undefinedLocationOnBookingStates: CheckUndefinedLocationDTO[],
  buildingOrFloorOnBoardingStates: CheckUndefinedLocationDTO[],
  buildingOrFloorOnBookingStates: CheckUndefinedLocationDTO[],
  maxPersonsBuilding: CheckUndefinedLocationDTO[],
  maxPersonsFloor: CheckUndefinedLocationDTO[],
  floorIsDeskBookingEnabled: CheckUndefinedLocationDTO[],
  wrongArchiveLocations: Location[],
  wrongArchiveBuildings: Building[],
  wrongArchiveFloors: Floor[],
  wrongArchiveOffices: Office[],
}

export interface CheckUndefinedLocationDTO {
  companyName: string;
  hasError: boolean;
}