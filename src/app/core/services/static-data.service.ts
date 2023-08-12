import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { DateTime, Settings } from 'luxon';
import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { Observable, Subject } from 'rxjs';
import {
  Day, HierarchyLevel, LanguageEnum, LanguageLocales,
  LocalStorageKeys,
  Location, LocationChangedEventWithTrigger, LocationDetailDTO, Location_InOffice_Name, Office, Seat, Team, TimeSlotTemplateDTO, Week
} from './workloads';

const Base_Padding_Left_Location = 15;
const Length_Of_Week = 7;

@Injectable()
export class StaticDataService {

  public targetJSDate: Date;

  public targetWeek: Week;
  public targetDay: Day[];
  public targetDate: DateTime;

  private _locationChangedSubject: Subject<LocationChangedEventWithTrigger> = new Subject();
  public locationChanged$: Observable<LocationChangedEventWithTrigger>;

  private _userProfileChangedSubject: Subject<boolean> = new Subject();
  public userProfileChanged$: Observable<boolean>;

  // Map detail popup
  set isModalMapDetailDisplayed(val: boolean) {
    this._isModalMapDetailDisplayedSubject.next(val);
  }
  private _isModalMapDetailDisplayedSubject: Subject<boolean> = new Subject();
  public isModalMapDetailDisplayed$: Observable<boolean>;

  constructor(
    private translocoService: TranslocoService,
    private bsLocaleService: BsLocaleService
  ) {
    this.locationChanged$ = this._locationChangedSubject.asObservable();
    this.userProfileChanged$ = this._userProfileChangedSubject.asObservable();
    this.isModalMapDetailDisplayed$ = this._isModalMapDetailDisplayedSubject.asObservable();
  }

  public notifyLocationChanged(payload: LocationChangedEventWithTrigger) {
    this._locationChangedSubject.next(payload);
  }

  public notifyUserProfileChanged() {
    this._userProfileChangedSubject.next(true);
  }

  public findLocationById(list: Location[], id: string): Location | null {
    if (list.length == 0) return null;
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      if (item.id == id) {
        return item;
      }
      const found = this.findLocationById(item.children, id);

      if (found != null) return found;
    }
    return null;
  }

  /**
   * Set padding left for each location to display
   * @param locations 
   * @param level 
   */
  public updatePaddingLeft(locations: Location[], level: number = 1) {
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      if (!loc.inOffice || loc.hierarchyLevel == null)
        loc.paddingLeft = Base_Padding_Left_Location;
      else {
        loc.paddingLeft = level * Base_Padding_Left_Location;
        this.updatePaddingLeft(loc.children, level + 1);
      }
    }
  }

  /**
   * Update consolidate actual load
   * @param locations 
   */
  public updateConsolidatedActualLoad(locations: Location[]) {
    for (let i = 0; i < locations.length; i++) {
      const loc = locations[i];
      loc.consolidatedActualLoad = loc.actualLoad.map(x => Object.values(x)[0]);
      this.updateConsolidatedActualLoad(loc.children);
    }
  }

  public dateTimeToUTCDate(date: DateTime): string {
    return "" + date.year + "-" + ("0" + date.month).slice(-2) + "-" + ("0" + date.day).slice(-2) + "T" + ("0" + date.hour).slice(-2) + ":" + ("0" + date.minute).slice(-2) + ":00";
  }

  public dateToUTCDate(date: Date): string {
    return this.dateTimeToUTCDate(DateTime.fromJSDate(date));

  }

  /**
   * Get list of working days
   * @returns
   */
  public getWorkingDays(opt: { long: boolean, includeWeekend?: boolean }): string[] {
    let monday = DateTime.now().startOf('week');
    const days = [];
    let dt = monday;
    const nbDays = !opt.includeWeekend ? Length_Of_Week : Length_Of_Week + 2;
    for (let i = 1; i < nbDays - 1; i++) {
      const dayName = !opt.long ? dt.weekdayShort : dt.weekdayLong;
      days.push(dayName);
      dt = monday.plus({ days: i });
    }
    return days;
  }

  /**
   * Get dates of week for given date
   * @param date 
   * @param opt 
   * @returns 
   */
  public getDatesOfWeekForGivenDate(date: DateTime, opt: { long: boolean, includeWeekend?: boolean }): DateTime[] {
    let monday = date.startOf('week');
    const days: DateTime[] = [];
    let dt = monday;
    const nbDays = !opt.includeWeekend ? Length_Of_Week : Length_Of_Week + 2;
    for (let i = 1; i < nbDays - 1; i++) {
      days.push(dt);
      dt = monday.plus({ days: i });
    }
    return days;
  }

  public getDatesOfMonthForGivenDate(date: DateTime, radius: number = 0): DateTime[] {
    const dates: DateTime[] = [];
    const center = date.set({ day: 1 });
    const min = center.minus({ month: radius });
    const max = center.plus({ month: radius + 1 });
    let iter = min;
    while (iter < max) {
      dates.push(iter);
      iter = iter.plus({ days: 1 });
    }
    return dates;
  }

  public getDayInMonths(dt: Date): number {
    var month = dt.getMonth();
    var year = dt.getFullYear();
    return new Date(year, month, 0).getDate();
  }

  /**
   * Check if week is confirmed
   * @param days 
   * @returns 
   */
  public isWeekConfirmed(days: Day[][]): boolean {
    let isConfirmed = true;

    for (let locationsOfDay of days) {
      if (locationsOfDay.findIndex(x => !x.isConfirmed) >= 0) {
        return false;
      }
    }

    return isConfirmed;
  }

  public factoryMailContentToRemindOnboarding(email: string): string {
    const subject = 'Reminder to finish your Flexteam onboarding';
    const body = `Hello,%0D%0A%0D%0AHere is a quick reminder that I'm waiting for you to finish your onboarding on flexteam.%0D%0AFlexteam helps you plan your week, book your desk and synchronize with your colleagues :)
%0D%0AYou received an email from Flexteam with your personal onboarding link (check your spam folder).%0D%0A%0D%0ASincerely`;
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  /**
   * Change language for app
   * @param langToSet 
   */
  changeLanguage(langToSet: string) {
    Settings.defaultLocale = LanguageLocales[langToSet];
    localStorage.setItem(LocalStorageKeys.Language, langToSet);

    const lang = langToSet?.split('-')[0] || LanguageEnum.En;
    this.translocoService.setActiveLang(lang);
    this.bsLocaleService.use(lang);

    console.info(`APP locale is set to ${langToSet}`);

  }

  public getMandatoryOfficeDaysOfTeam(team: Team): boolean[] {
    return [team.isMonMandatory, team.isTueMandatory,
    team.isWedMandatory,
    team.isThurMandatory, team.isFriMandatory];
  }

  public getConsolidatedMandatoryOfficeDays(teams: Team[]): boolean[] {
    const list: boolean[] = [];
    for (let i = 0; i < Length_Of_Week - 2; i++) {
      let tmp = false;
      for (let j = 0; j < teams.length; j++) {
        tmp = tmp || this.getMandatoryOfficeDaysOfTeam(teams[j])[i];
      }
      list.push(tmp);
    }
    return list;
  }

  /**
   * Factory timeslot text
   * @param timeslot 
   * @returns 
   */
  private factoryTimeslotText = (timeslot: TimeSlotTemplateDTO): string => {
    const text1 = this._to2Digits(timeslot.startHour);
    const text2 = this._to2Digits(timeslot.startMinutes);
    const text3 = this._to2Digits(timeslot.stopHour);
    const text4 = this._to2Digits(timeslot.stopMinutes);
    return `${text1}h${text2} - ${text3}h${text4}`;
  }

  /**
   * Factory timeslot options (id, label)
   * @param timeslots 
   * @param modeHalfDay 
   * @returns 
   */
  public factoryTimeslotOptions(timeslots: TimeSlotTemplateDTO[], modeHalfDay: boolean): { id: string, label: string }[] {
    const texts = timeslots
      .map(x => {
        return {
          id: x.id,
          label: this.factoryTimeslotText(x)
        }
      });
    return modeHalfDay ? texts : [{ id: null, label: null }];
  }

  /**
   * Get location detail
   * @param targetUserId 
   * @param office 
   * @param seat 
   * @param timeslotId 
   * @param doLeave 
   * @returns 
   */
  public getLocationDetailDTOFromOffice(office: Office,
    seat: Seat, timeslotId: string, doLeave: boolean): LocationDetailDTO {
    return {
      target: office.id,
      targetLocation: {
        ...office,
        hierarchyLevel: HierarchyLevel.Office,
        inOffice: true,
        isRemoteWork: false,
        maxPlaceAvailable: office.allowedLoad,
        maxPerson: office.capacity,
        actualLoad: office.actualLoad,
        name: Location_InOffice_Name
      },
      seatId: seat?.id,
      doLeave: doLeave,
      timeslotId: timeslotId
    };

  }

  /**
   * Convert to 2 digits version
   * @param val
   * @returns 
   */
  private _to2Digits(val: string | number): string {
    return val.toString().length <= 1 ? `0${val}` : val.toString();
  }

}
