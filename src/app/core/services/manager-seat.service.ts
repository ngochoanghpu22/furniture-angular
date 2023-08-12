import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AddSeatDTO, BookSeatDTO, BookSeatRequest, OccupationBuildingDTO, Seat, SeatArchitecture, SelectionItem, UserSeat, Workload } from './workloads';

@Injectable()
export class ManagerSeatService extends BaseApiService {

  private name: string = "Seat";

  private baseUrl = '';

  constructor(
    protected http: HttpClient,
  ) {
    super(http);
    this.baseUrl = `${this.accessPointUrl}/api/${this.name}`;
  }

  bookSeat(dto: BookSeatRequest): Observable<Workload<BookSeatDTO>> {
    const isoDate = DateTime.fromJSDate(dto.date).toISO();
    return this.http.post<Workload<BookSeatDTO>>(`${this.baseUrl}/BookSeat`, {
      ...dto,
      date: isoDate,
    });
  }

  uploadArchitectureSeat(floorId: string, image: string | ArrayBuffer) {
    return this.http.post<Workload<any>>(`${this.baseUrl}/UploadArchitectureSeat`, { floorId, image });
  }

  leaveSeat(dto: BookSeatRequest) {
    const isoDate = DateTime.fromJSDate(dto.date).toISO()
    return this.http.post<Workload<any>>(`${this.baseUrl}/LeaveSeat`, {
      ...dto,
      date: isoDate,
    });
  }

  getSeatArchitecture(floorId: string): Observable<Workload<SeatArchitecture>> {
    return this.http.get<Workload<SeatArchitecture>>(`${this.baseUrl}/SeatArchitecture/${floorId}`)
      .pipe(map(x => {
        if (!x.workload) return x;
        const base64Image = x.workload.base64Image;
        if (base64Image.indexOf("/api") >= 0) {
          x.workload.base64Image = `${this.accessPointUrl}${base64Image}`;
        }
        return x;
      }))
  }

  getSeatData(floorId: string, date: Date): Observable<Workload<UserSeat[]>> {
    const suffix = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    return this.http.get<Workload<UserSeat[]>>(`${this.baseUrl}/GetSeatData/${floorId}/${suffix}`);
  }

  getHighlightUsers(selection: SelectionItem[]): Observable<Workload<string[]>> {
    return this.http.post<Workload<string[]>>(`${this.baseUrl}/GetHighlightUsers`, {
      selection
    });
  }

  public addOrEditSeat(floorId: string, req: AddSeatDTO): Observable<Workload<Seat>> {
    return this.http.post<Workload<Seat>>(`${this.baseUrl}/${floorId}/addOrEditSeat`, req);
  }

  public deleteSeat(floorId: string, seatId: string): Observable<Workload<any>> {
    return this.http.delete<Workload<any>>(`${this.baseUrl}/floor/${floorId}/deleteSeat/${seatId}`);
  }

  public getOccupationsByBuilding(buildingId: string, date: Date): Observable<Workload<OccupationBuildingDTO>> {
    return this.http.post<Workload<OccupationBuildingDTO>>(`${this.baseUrl}/building/${buildingId}/GetOccupations`, {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    });
  }

}
