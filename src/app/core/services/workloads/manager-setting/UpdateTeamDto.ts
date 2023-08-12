export interface UpdateTeamDto {
  name: string;
  description: string;
  isSunMandatory: boolean;
  isMonMandatory: boolean;
  isTueMandatory: boolean;
  isWedMandatory: boolean;
  isThurMandatory: boolean;
  isFriMandatory: boolean;
  isSatMandatory: boolean;
}