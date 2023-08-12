import { ManagerUserData } from "./ManagerUserData";

export class ManagerTeamData {
    public id: string = "";
    public name: string = "";
    public ownerId: string = "";
    public isHierarchy: boolean = false;
    public isSocial: boolean = false; 
    public isPrefered: boolean = false;

    public users: Array<ManagerUserData> = [];
    public mandatoryOfficeDays: Array<boolean> = [];
}
