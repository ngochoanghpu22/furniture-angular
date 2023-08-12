import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { toApiPath } from '../helpers';
import { BaseApiService } from './base-api.service';
import { StaticDataService } from './static-data.service';
import {
  ArchivedOfficeDTO,
  ArchiveDTO, AuthProvider, Building, EditFloorDTO, ExternalOfficeDTO, Floor,
  FloorInfoDTO,
  Guid_Empty,
  LinkToExternalOfficeRequest, MapInfoWindowBuildingDTO,
  MapInfoWindowFloorDTO, MapInfoWindowUserDTO, MeetingRoomDTO,
  OccupationRule, Office, Seat, User, UserPresenceInfo, Workload
} from './workloads';

@Injectable()
export class ManagerOfficeService extends BaseApiService {

  private name: string = "ManagerOffice";

  private baseUrl = '';

  constructor(
    protected http: HttpClient,
    private staticDataService: StaticDataService
  ) {
    super(http);
    this.baseUrl = `${this.accessPointUrl}/api/${this.name}`;
  }

  getOfficesByFloor(floorId: string) {
    return this.http.get<Workload<Office[]>>(`${this.baseUrl}/GetOfficesByFloor/${floorId}`)
      .pipe(map(x => {
        if (!x.workload) return x;
        for (var i = 0; i < x.workload.length; i++) {
          x.workload[i].contextualPicture = toApiPath(x.workload[i].contextualPicture, this.accessPointUrl);
        }
        return x;
      }));
  }

  getOfficesAndMeetingRoomsByFloor(floorId: string) {
    return this.http.get<Workload<Office[]>>(`${this.baseUrl}/GetOfficesAndMeetingRoomsByFloor/${floorId}`)
      .pipe(map(x => {
        if (!x.workload) return x;
        for (var i = 0; i < x.workload.length; i++) {
          x.workload[i].contextualPicture = toApiPath(x.workload[i].contextualPicture, this.accessPointUrl);
        }
        return x;
      }));
  }

  restoreBuilding(id: string) {
    return this.http.post<Workload<Building>>(`${this.baseUrl}/RestoreBuilding/${id}`, {});
  }

  restoreOffice(id: string) {
    return this.http.post<Workload<Office>>(`${this.baseUrl}/RestoreOffice/${id}`, {});
  }

  restoreFloor(id: string) {
    return this.http.post<Workload<Floor>>(`${this.baseUrl}/RestoreFloor/${id}`, {});
  }

  getArchivedOffices(companyId: string): Observable<Workload<ArchivedOfficeDTO[]>> {
    return this.http.get<Workload<ArchivedOfficeDTO[]>>(`${this.baseUrl}/${companyId}/GetArchivedOffices`);
  }

  getArchivedFloors(companyId: string): Observable<Workload<ArchivedOfficeDTO[]>> {
    return this.http.get<Workload<ArchivedOfficeDTO[]>>(`${this.baseUrl}/${companyId}/GetArchivedFloors`);
  }

  getArchivedBuildings(companyId: string): Observable<Workload<ArchivedOfficeDTO[]>> {
    return this.http.get<Workload<ArchivedOfficeDTO[]>>(`${this.baseUrl}/${companyId}/GetArchivedBuildings`);
  }

  getBuildings() {
    return this.http.get<Workload<Building[]>>(`${this.baseUrl}/GetBuildings`);
  }

  getFloorsByBuilding(buildingId: string) {
    return this.http.get<Workload<Floor[]>>(`${this.baseUrl}/GetFloorsByBuilding/${buildingId}`)
      .pipe(
        map(x => ({
          ...x,
          workload: x.workload?.length ? x.workload.map(w => ({
            ...w,
            contextualPicture: toApiPath(w.contextualPicture, this.accessPointUrl)
          })) : []
        })
        ));
  }

  addOrEditBuilding(dto: Building): Observable<any> {
    if (!dto.id) dto.id = Guid_Empty;
    return this.http.post<Workload<Building>>(`${this.baseUrl}/AddOrEditBuilding`,
      {
        building: dto
      });
  }

  archiveFloor(dto: ArchiveDTO): Observable<Workload<Floor>> {
    return this.http.post<Workload<Floor>>(`${this.baseUrl}/ArchiveFloor`, dto);
  }

  archiveOffice(dto: ArchiveDTO): Observable<Workload<Office>> {
    return this.http.post<Workload<Office>>(`${this.baseUrl}/ArchiveOffice`, dto);
  }

  archiveBuilding(dto: ArchiveDTO): Observable<Workload<Building>> {
    return this.http.post<Workload<Building>>(`${this.baseUrl}/ArchiveBuilding`, dto);
  }

  addOrEditFloor(dto: EditFloorDTO): Observable<Workload<Floor>> {
    return this.http.post<Workload<Floor>>(`${this.baseUrl}/AddOrEditFloor`, dto).pipe(
      map(x => ({
        ...x,
        workload: {
          ...x.workload,
          contextualPicture: toApiPath(x.workload.contextualPicture, this.accessPointUrl)
        }
      }))
    );
  }

  addOrEditOffice(req: Office): Observable<any> {
    if (!req.id) req.id = Guid_Empty;
    const dto: any = { ...req };
    if (dto.coordinate != null) {
      dto.coordinate = JSON.stringify(dto.coordinate);
    }
    return this.http
      .post<Workload<Floor>>(`${this.baseUrl}/AddOrEditOffice`, {
        office: dto,
      })
      .pipe(
        map((x) => ({
          ...x,
          workload: {
            ...x.workload,
            contextualPicture: toApiPath(x.workload.contextualPicture, this.accessPointUrl),
          },
        }))
      );
  }

  reorder(dto: any): Observable<any> {
    return this.http.post<Workload<any>>(`${this.baseUrl}/Reorder`, dto);
  }

  removeUserFromPresenceList(locationId: string, date: DateTime, userId: string): Observable<any> {
    return this.http.post(
      `${this.accessPointUrl}/api/plan/RemoveUserFromPresenceList/${userId}`,
      {
        locationId: locationId,
        date: this.staticDataService.dateToUTCDate(date.toJSDate()),
      });
  }

  loadUsersForOffice(locationId: string, date: DateTime): Observable<Workload<UserPresenceInfo>> {
    return this.http.post<Workload<UserPresenceInfo>>(
      `${this.baseUrl}/LoadUsersForOffice`,
      {
        locationId: locationId,
        date: this.staticDataService.dateToUTCDate(date.toJSDate()),
      });
  }

  getMapInfoWindowFloor(floorId: string, date: DateTime): Observable<Workload<MapInfoWindowFloorDTO>> {
    return this.http.post<Workload<MapInfoWindowFloorDTO>>(
      `${this.baseUrl}/GetMapInfoWindowFloor`,
      {
        locationId: floorId,
        date: this.staticDataService.dateToUTCDate(date.toJSDate()),
      });
  }

  getMapInfoWindowBuilding(buildingId: string, date: DateTime): Observable<Workload<MapInfoWindowBuildingDTO>> {
    return this.http.post<Workload<MapInfoWindowBuildingDTO>>(
      `${this.baseUrl}/GetMapInfoWindowBuilding`,
      {
        locationId: buildingId,
        date: this.staticDataService.dateToUTCDate(date.toJSDate()),
      });
  }

  getMapInfoWindowUsers(date: DateTime): Observable<Workload<MapInfoWindowUserDTO[]>> {
    return this.http.post<Workload<MapInfoWindowUserDTO[]>>(
      `${this.baseUrl}/GetMapInfoWindowUsers`,
      {
        date: this.staticDataService.dateToUTCDate(date.toJSDate()),
      });
  }

  loadUsersForBuilding(buildingId: string, date: Date): Observable<Workload<UserPresenceInfo>> {
    return this.http.post<Workload<UserPresenceInfo>>(
      `${this.baseUrl}/LoadUsersForBuilding`,
      {
        locationId: buildingId,
        date: this.staticDataService.dateToUTCDate(date),
      });
  }

  getExcelUsersOnSite(locationId: string, date: DateTime): Observable<Blob> {
    return this.http.post(
      `${this.baseUrl}/GetExcelUsersOnSite`,
      {
        locationId: locationId,
        date: this.staticDataService.dateToUTCDate(date.toJSDate()),
      }, { responseType: 'blob' });
  }

  getExternalOffices(authProvider: AuthProvider): Observable<Workload<ExternalOfficeDTO[]>> {
    return this.http.get<Workload<ExternalOfficeDTO[]>>(`${this.baseUrl}/GetExternalOffices/${authProvider}`);
  }

  linkOfficeToExternalOffice(req: LinkToExternalOfficeRequest): Observable<Workload<any[]>> {
    return this.http.post<Workload<any[]>>(`${this.baseUrl}/LinkOfficeToExternalOffice`, req);
  }

  getOccupationRulesOfWeek(officeId: string, targetDate: DateTime): Observable<Workload<any[]>> {
    return this.http.post<Workload<any[]>>(`${this.baseUrl}/GetOccupationRulesOfWeek/${officeId}`, {
      startDate: targetDate.toISODate()
    });
  }

  addOrEditOccupationRule(officeId: string, dto: OccupationRule) {
    const date = this.staticDataService.dateToUTCDate(dto.date);
    return this.http.post(`${this.baseUrl}/AddOrEditOccupationRule/${officeId}`, {
      ...dto,
      date: date
    });
  }

  deleteOccupationRule(occupationRuleId: string) {
    return this.http.delete(`${this.baseUrl}/DeleteOccupationRule/${occupationRuleId}`);
  }

  removeOnlyOccupationRuleItem(occupationRuleItemId: string) {
    return this.http.delete(`${this.baseUrl}/RemoveOnlyOccupationRuleItem/${occupationRuleItemId}`);
  }

  /**
   * Get floor infos with list of offices, seat data with user
   * @param floorId 
   * @param date 
   * @returns 
   */
  getFloorInfos(floorId: string, date: Date): Observable<Workload<FloorInfoDTO>> {
    const suffix = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    return this.http.get<Workload<FloorInfoDTO>>(`${this.baseUrl}/GetFloorInfos/${floorId}/${suffix}`);
  }

  public updateCoordinates(floorId: string, seats: Seat[], meetingRooms: MeetingRoomDTO[]): Observable<Workload<boolean>> {
    return this.http.post<Workload<boolean>>(`${this.baseUrl}/${floorId}/updateCoordinates`, {
      seats, meetingRooms
    });
  }

  public toggleDeskBooking(floorId: string, enabled: boolean) {
    return this.http.post<Workload<boolean>>(`${this.baseUrl}/${floorId}/ToggleDeskBooking/${enabled}`, {});
  }


}
