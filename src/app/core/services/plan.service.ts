import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { StaticDataService } from './static-data.service';
import {
  BookingLocationRequest,
  BookingLocationResponse, Day, IMetadataValue, MapPin, SeatInvitedEvent, Week, Workload
} from './workloads';

@Injectable()
export class PlanService extends BaseApiService {

  constructor(
    protected http: HttpClient,
    private staticDataService: StaticDataService
  ) {
    super(http);
  }

  public getMonthStatus(year: number, month: number): Observable<Workload<Week[]>> {
    return this.http
      .post<Workload<Week[]>>(this.accessPointUrl + '/api/Plan/GetMonthStatus',
        { year: year, month: month });
  }

  public getMonthStatusForUser(userId: string, year: number, month: number): Observable<Workload<Week[]>> {
    return this.http
      .post<Workload<Week[]>>(this.accessPointUrl + `/api/Plan/GetMonthStatusForUser/${userId}`,
        { year: year, month: month });
  }

  public getNextDayInOffice(userId: string): Observable<Workload<any[]>> {
    return this.http
      .get<Workload<any[]>>(this.accessPointUrl + `/api/Plan/GetNextDayInOffice/${userId}`);
  }

  public getDayStatus(year: number, month: number, day: number): Observable<Workload<Day[]>> {
    return this.http
      .post<Workload<Day[]>>(this.accessPointUrl + '/api/Plan/GetDayStatus',
        { year: year, month: month, day: day });
  }

  public checkIfCanChangeLocation(req: BookingLocationRequest): Observable<Workload<BookingLocationResponse>> {
    return this.http
      .post<Workload<BookingLocationResponse>>(this.accessPointUrl + '/api/Plan/CheckIfCanChangeLocation',
        {
          ...req,
          date: this.staticDataService.dateToUTCDate(req.date)
        });
  }

  public changeLocationForUser(req: BookingLocationRequest): Observable<Workload<BookingLocationResponse>> {
    return this.http
      .post<Workload<BookingLocationResponse>>(this.accessPointUrl + '/api/Plan/ChangeLocationForUser', {
        ...req,
        date: this.staticDataService.dateToUTCDate(req.date)
      });
  }

  public updateMetadataValues(values: Array<IMetadataValue>): Observable<Workload<IMetadataValue>> {
    return this.http
      .put<Workload<IMetadataValue>>(this.accessPointUrl + `/api/Plan/UpdateMetadataValues`, values);
  }

  public getMapPinFromType(typeName: string) {
    return this.http
      .post<Workload<MapPin[]>>(this.accessPointUrl + '/api/Plan/getMapPinFromType?type=' + typeName,
        '');
  }

  /**
 * API: invite seat for a internal/external user for a date
 * @param req 
 * @returns 
 */
  public inviteSeat(req: SeatInvitedEvent): Observable<Workload<any>> {
    const isoDate = DateTime.fromJSDate(req.targetDate).toISO()
    return this.http.post<Workload<any>>(`${this.accessPointUrl}/api/Plan/InviteSeat`, {
      email: req.email,
      seatId: req.seat?.id,
      officeId: req.office?.id,
      targetDate: isoDate,
      timeslotIndex: req.timeslotIndex,
      metadataValues: req.metadataValues
    });
  }

}
