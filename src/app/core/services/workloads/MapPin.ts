import { TypeOfSpace } from "./enums";

export class MapPin {
  id: string;
  type: string;
  name: string = '';
  typeOfSpace: TypeOfSpace;
  address: string;
  postalCode: number;
  city: string = '';
  longitude?: number;
  latitude?: number;
  photo: string = '';
  link: string = '';
  geographyPoint: string = '';
  faIconName: string = '';
}
