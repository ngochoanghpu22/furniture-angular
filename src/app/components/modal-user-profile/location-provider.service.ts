import { BookingLocationRequest, BookingLocationResponse } from '@flex-team/core';
import { Observable } from 'rxjs';

export abstract class LocationProviderService {

  constructor() { }
  abstract trySaveLocationOrBookSeat(dto: BookingLocationRequest,
    coreTeamOfUser: { name: string }): Observable<any>;

  abstract displayPopupConfirmationToBookOrWarning(resp: BookingLocationResponse, payload: any): Observable<boolean>
}
