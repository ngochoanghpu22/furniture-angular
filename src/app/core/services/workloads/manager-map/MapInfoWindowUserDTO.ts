import { HierarchyLevel } from "../enums";

export interface MapInfoWindowUserDTO {
  id: string;
  fullName: string;
  email: string;
  tinyPicture: string;
  location: MapInfoWindowGeoLocationOfUserDTO;
}

export interface MapInfoWindowGeoLocationOfUserDTO extends GeoLocationCoordinates {
  id: string;
  name: string;
  address: string;
  orderInList: number;
  color: string;
  hierarchyLevel: HierarchyLevel | null;
}

export interface GeoLocationCoordinates {
  lat: number | null;
  lng: number | null;
}