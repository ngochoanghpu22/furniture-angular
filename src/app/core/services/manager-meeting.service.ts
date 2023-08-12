import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { CreateMeetingDTO, EditMeetingDTO, MeetingDetailDTO, MeetingListItemDTO, MeetingRoomDTO, MeetingSearchUserDTO, SelectionItem, Workload } from './workloads';

@Injectable()
export class ManagerMeetingService extends BaseApiService {

  private name: string = "Meeting";

  private baseUrl = '';

  constructor(
    protected http: HttpClient
  ) {
    super(http);
    this.baseUrl = `${this.accessPointUrl}/api/${this.name}`;
  }

  getAllUsersInCompany(date: DateTime): Observable<Workload<MeetingSearchUserDTO[]>> {
    return this.http.post<Workload<MeetingSearchUserDTO[]>>(`${this.baseUrl}/GetAllUsersInCompany`,{
      targetDate: date.toISO()
    });
  }

  getMeetingRoomsOfFloor(floorId: string): Observable<Workload<MeetingRoomDTO[]>> {
    return this.http.get<Workload<MeetingRoomDTO[]>>(`${this.baseUrl}/${floorId}/GetMeetingRoomsOfFloor`);
  }

  getListMeetingsByOffice(officeId: string, start: DateTime, end: DateTime): Observable<Workload<MeetingListItemDTO[]>> {
    return this.http.post<Workload<MeetingListItemDTO[]>>(`${this.baseUrl}/${officeId}/GetListMeetingsByOffice`, {
      startDate: start.toISO(),
      endDate: end.toISO()
    });
  }

  getMeetingDetail(meetingId: string): Observable<Workload<MeetingDetailDTO>> {
    return this.http.get<Workload<MeetingDetailDTO>>(`${this.baseUrl}/GetMeetingDetail/${meetingId}`)
    .pipe(map(x => {
      x.workload.startDate = new Date(x.workload.startDate);
      x.workload.endDate = new Date(x.workload.endDate);
      return x;
    }));
  }

  createMeeting(dto: CreateMeetingDTO): Observable<Workload<boolean>> {
    return this.http.post<Workload<boolean>>(`${this.baseUrl}/CreateMeeting`, dto);
  }

  editMeeting(dto: EditMeetingDTO): Observable<Workload<any>> {
    return this.http.put<Workload<any[]>>(`${this.baseUrl}/EditMeeting`, dto);
  }

  deleteMeeting(meetingId: string): Observable<Workload<boolean>> {
    return this.http.delete<Workload<boolean>>(`${this.baseUrl}/DeleteMeeting/${meetingId}`);
  }

}
