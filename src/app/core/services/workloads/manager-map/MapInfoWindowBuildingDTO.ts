import { MapInfoWindowFloorDTO } from "./MapInfoWindowFloorDTO";

export interface MapInfoWindowBuildingDTO {
  name: string;
  location: string;
  floors: MapInfoWindowFloorDTO[];
}