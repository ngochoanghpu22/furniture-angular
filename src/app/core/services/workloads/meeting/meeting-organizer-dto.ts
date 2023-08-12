import { User } from "../User";

export class MeetingOrganizerDTO {
  fullName: string;
  email: string;
  id: string;
  image: string;

  constructor(user: User) {
    this.fullName = user.fullName;
    this.email = user.email;
    this.id = user.id;
    this.image = user.tinyPicture;
  }
}