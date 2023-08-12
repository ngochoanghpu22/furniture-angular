import { MeetingRoomDTO } from "../meeting";
import { Office } from "../Office";
import { UserSeat } from "../Seat";

export interface FloorInfoDTO {
    isDeskBookingEnabled: boolean;
    offices: Office[];
    meetingRooms: MeetingRoomDTO[];
    userSeats: UserSeat[];
}