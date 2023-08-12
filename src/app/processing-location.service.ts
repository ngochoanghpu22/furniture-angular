import { Injectable } from '@angular/core';
import { ModalConfirmationComponent, ModalLocationReachedMaxPlaceComponent, ModalService } from '@design-system/core';
import {
  AuthenticationService, BookingLocationRequest, BookingLocationResponse,
  BookingLocationRules, BookSeatRequest, ManagerSeatService, MessageService,
  PlanService, StaticDataService, Workload
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { DateTime } from 'luxon';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

/**
 * Service to treat all process of booking location
 */
@Injectable()
export class ProcessingLocationService {

  constructor(
    private authService: AuthenticationService,
    private planService: PlanService,
    private messageService: MessageService,
    private staticDataService: StaticDataService,
    private translocoService: TranslocoService,
    private managerSeatService: ManagerSeatService,
    private modalService: ModalService
  ) { }

  public trySaveLocationOrBookSeat(req: BookingLocationRequest,
    coreTeamOfUser: { name: string }): Observable<Workload<any>> {

    const dayIndex = req.dayIndex ?? (DateTime.fromJSDate(req.date).weekday - 1);

    // Check limit number weeks booking
    const limitBookingInFuture = this.authService.limitBookingInFuture;
    const limitDate = DateTime.now().plus({ weeks: limitBookingInFuture });

    if (limitDate <= DateTime.fromJSDate(req.date)) {
      this.messageService.error('notifications.limit_booking.title', {
        limitValue: limitBookingInFuture
      })
      return of(new Workload());
    }

    // Check reach max place for location
    const reachMaxCapacityIndex = req.locations.findIndex(x =>
      x.targetLocation.hierarchyLevel != null &&
      x.targetLocation.inOffice &&
      x.targetLocation.actualLoad[dayIndex] >= x.targetLocation.maxPerson
      && !x.doLeave);

    let isReachedMaxPlace$ = of(true);
    if (reachMaxCapacityIndex >= 0) {
      if (this.authService.isFloatingReservationsEnabled) {
        isReachedMaxPlace$ = this.showModalLocationReachedMaxPlace();
      } else {
        const formatDate = this.authService.formatDate;
        this.messageService.error('notifications.MaxPlaceAvailableInLocation.title', {
          office: req.locations[reachMaxCapacityIndex].targetLocation.address,
          dateTargetFull: DateTime.fromJSDate(req.date).toFormat(formatDate)
        });
        return of(new Workload());
      }
    }

    return isReachedMaxPlace$.pipe(switchMap(ok => {
      if (ok) {
        return this._sendRequestBookLocationOrBookSeat(req, coreTeamOfUser);
      } else {
        return of(new Workload());
      }
    }))

  }

  /**
   * Send request booking location or book seat to Back
   * @param dto 
   * @param coreTeamOfUser 
   * @returns 
   */
  private _sendRequestBookLocationOrBookSeat(req: BookingLocationRequest,
    coreTeamOfUser: { name: string }) {

    // If for leaving seat, no need to check rules
    const workloadLeaveSeat = new Workload<BookingLocationResponse>();
    workloadLeaveSeat.workload = { canBook: true } as BookingLocationResponse;

    const askToLeaveSeat = req.locations.findIndex(x => x.doLeave) >= 0;

    const action$: Observable<Workload<BookingLocationResponse>>
      = askToLeaveSeat ? of(workloadLeaveSeat) : this.planService.checkIfCanChangeLocation(req);

    return action$.pipe(switchMap((resp: Workload<BookingLocationResponse>) => {
      if (resp.workload.canBook) {
        // All rules passed, let's book
        return this.saveLocationOrBookSeat(req);
      } else {
        // Some rules failed, check exception to try to book
        const dayIndex = DateTime.fromJSDate(req.date).weekday - 1;
        const payload = {
          teamName: coreTeamOfUser.name,
          dayName: this.staticDataService.getWorkingDays({ long: true })[dayIndex]
        };

        const callback$ = this.displayPopupConfirmationToBookOrWarning(resp.workload, payload);
        return callback$.pipe(switchMap((ok: boolean) => {
          if (ok === true) {
            return this.saveLocationOrBookSeat(req);
          }
          return of(new Workload());
        }))
      }
    }))
  }

  /**
  * Factory message when check if can book location
  * @param resp 
  * @returns 
  */
  private factoryMessageWhenRuleFailed(resp: BookingLocationResponse, payload: any)
    : { messageKey: string, params: any } {

    let messageKey;
    let params: any = {
      policyName: resp.policyName,
      managerName: resp.managerName,
      teamName: payload.teamName,
      dayName: payload.dayName
    };

    // Confirmation with exception, factory message for confirmation
    if (resp.canBookWithException || resp.bookedByManager) {
      //User booked for himself
      if (resp.bookedForHimself) {
        switch (resp.rule) {
          case BookingLocationRules.MaxOfficeDaysPerWeek:
          case BookingLocationRules.MaxRemoteDaysPerWeek:
          case BookingLocationRules.MaxRemoteDaysPerMonth:
            messageKey = !resp.bookedByManager
              ? 'message_warning_booking_location.booking_not_compatible_working_policy_with_exception_confirmation'
              : 'message_warning_booking_location.booking_not_compatible_working_policy_booked_by_manager_for_himself_confirmation';
            break;
          case BookingLocationRules.Occupation:
          case BookingLocationRules.MandatoryOfficeDays:
            messageKey = 'message_warning_booking_location.booking_not_compatible_team_booked_by_manager_for_himself_confirmation';
            break;
        }
      } else {
        // Manager book for other users by overriding the rules
        switch (resp.rule) {
          case BookingLocationRules.MaxOfficeDaysPerWeek:
          case BookingLocationRules.MaxRemoteDaysPerWeek:
          case BookingLocationRules.MaxRemoteDaysPerMonth:
            messageKey = 'message_warning_booking_location.booking_not_compatible_working_policy_booked_by_manager_confirmation';
            break;
          case BookingLocationRules.Occupation:
          case BookingLocationRules.MandatoryOfficeDays:
            messageKey = 'message_warning_booking_location.booking_not_compatible_team_booked_by_manager_confirmation';
            break;
        }
      }

    } else {
      // Factory message for warning
      switch (resp.rule) {
        case BookingLocationRules.MaxOfficeDaysPerWeek:
          messageKey = 'message_error.RULE_LIMIT_OFFICE_DAYS_PER_WEEK_FAILED';
          break;
        case BookingLocationRules.MaxRemoteDaysPerWeek:
          messageKey = 'message_error.RULE_LIMIT_REMOTE_DAYS_PER_WEEK_FAILED';
          break;
        case BookingLocationRules.MaxRemoteDaysPerMonth:
          messageKey = 'message_error.RULE_LIMIT_REMOTE_DAYS_PER_MONTH_FAILED';
          break;
        case BookingLocationRules.MandatoryOfficeDays:
          messageKey = 'message_warning_booking_location.booking_not_compatible_mandatory_office_days_warning';
          break;
        case BookingLocationRules.Occupation:
          messageKey = 'message_error.RULE_BLOCKED_USERS_OCCUPATION';
          break;
      }
    }

    if (!messageKey) {
      throw new Error(`No message is provided for rule ${resp.rule}`);
    }

    return { messageKey, params };
  }

  private checkCanBookWithException(resp: BookingLocationResponse): boolean {
    return resp.canBookWithException || resp.bookedByManager;
  }

  private saveLocationOrBookSeat(req: BookingLocationRequest)
    : Observable<Workload<BookingLocationResponse>> {

    const timeslotIndexWithSeat = req.locations.findIndex(x => x.seatId != null);
    const doLeave = req.locations[0].doLeave;

    if (doLeave || timeslotIndexWithSeat >= 0) {
      const locationDto = doLeave ? req.locations[0] : req.locations[timeslotIndexWithSeat];

      const bookSeatReq = {
        seatId: locationDto.seatId,
        userId: req.userId,
        timeslotId: locationDto.timeslotId,
        date: req.date,
        metadataValues: locationDto.metadataValues,
        modeHalfDay: req.modeHalfDay
      } as BookSeatRequest;

      return locationDto.doLeave
        ? this.managerSeatService.leaveSeat(bookSeatReq)
        : this.managerSeatService.bookSeat(bookSeatReq);
    } else {
      return this.planService.changeLocationForUser(req);
    }

  }

  public displayPopupConfirmationToBookOrWarning(resp: BookingLocationResponse, payload: any): Observable<boolean> {
    const canBookWithException = this.checkCanBookWithException(resp);

    const { messageKey, params } = this.factoryMessageWhenRuleFailed(resp, payload);
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: '400px',
      data: {
        message: this.translocoService.translate(messageKey, params),
        forceConfirm: !canBookWithException
      }
    });
    return modalRef.afterClosed$;
  }

  private showModalLocationReachedMaxPlace(): Observable<boolean> {
    const modalRef = this.modalService.open(ModalLocationReachedMaxPlaceComponent, {
      width: 'auto',
    });
    return modalRef.afterClosed$;
  }

}
