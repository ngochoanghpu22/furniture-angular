import { Office } from "./Office";

export class Floor {
    id: string;
    idBuilding: string;
    name: string;
    capacity: number = 0;
    allowedLoad: number = 0;
    orderInList: number;
    mapUrl: string;
    offices: Office[] = [];
    contextualPicture: string;
    address?:string = '';
    archivedDate?: Date;
    archived: boolean = false;
    actualLoad?: number;
    isDeskBookingEnabled: boolean = false;
}
