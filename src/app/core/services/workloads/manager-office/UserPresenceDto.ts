export interface UserPresenceDto {
    id: string;
    officeId: string;
    fullName: string;
    teamName: string;
    tinyPicture: string;
    isOverload: boolean;
    isPrefered: boolean;
    isConfirmed: boolean;
    email: string;
    modificationDate: string;
}

export interface UserPresenceByTimeslotDto {
    timeslotId: string;
    users: UserPresenceDto[];
}

export interface UserPresenceInfo {
    confirmed: UserPresenceByTimeslotDto[];
    unconfirmed: UserPresenceDto[];
    overflow: UserPresenceDto[];
    allUsers: UserPresenceDto[];
}