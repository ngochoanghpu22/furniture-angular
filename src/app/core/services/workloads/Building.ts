import { Floor } from "./Floor";

export class Building {
    id: string;
    name: string;
    capacity: number = 0;
    allowedLoad: number = 0;
    location: string;
    orderInList: number;
    actualLoad?: number;
    address?: string = '';
    archivedDate: string = "";
    archived: boolean = false;
    floors: Floor[] = [];
    lat?: number;
    lng?: number;
}
