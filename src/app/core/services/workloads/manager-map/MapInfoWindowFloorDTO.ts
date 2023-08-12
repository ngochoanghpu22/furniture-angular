import { User } from "../User";

export interface MapInfoWindowFloorDTO {
  id:string;
  name: string;
  location: string;
  seatArchitectureUrl: string;
  capacity: number;
  actualLoad: number;
  users: User[];
}