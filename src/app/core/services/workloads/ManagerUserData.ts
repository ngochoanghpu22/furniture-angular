import { Day } from "./Day";
import { ManagerTeamData } from "./ManagerTeamData";

export class ManagerUserData {

    public userIndex: number = 0;
    public teamIndex: number = 0;
    public team: ManagerTeamData;

    public id: string = "";
    public fullName: string = "";
    public name: string = "";
    public avatar: string = "";
    public firstName: string = "";
    public lastName: string = "";
    public email: string = "";
    public roleSerialized: string = "";
    public tinyPicture: string = "";

    public days: Array<Array<Day>> = [];

    public checked?: boolean;
    public canEdit?: boolean;
    public isWeekConfirmed?: boolean;
    public isOnboarded?: boolean;

}
