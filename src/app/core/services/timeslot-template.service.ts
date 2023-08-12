import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';
import { TimeSlotTemplateDTO, TimeSlot, Workload } from './workloads';

@Injectable()
export class TimeslotTemplateService extends BaseApiService {

	private name: string = "TimeSlotTemplate";
	private baseUrl = '';

	constructor(protected http: HttpClient,) {
		super(http);
		this.baseUrl = `${this.accessPointUrl}/api/${this.name}`;
	}

	public getTimeslotTemplates(): Observable<Workload<TimeSlotTemplateDTO[]>> {
		return this.http.get<any>(this.baseUrl + `/GetTimeSlotTemplates`);
	}

	public addOrEditTimeSlot(dto: TimeSlotTemplateDTO): Observable<Workload<any>> {
		return this.http.post<Workload<any>>(this.baseUrl + '/AddOrEditTimeSlotTemplate', dto);
	}

	public deleteTimeSlot(id: string): Observable<Workload<TimeSlot>> {
		return this.http.delete<Workload<TimeSlot>>(this.baseUrl + `/DeleteTimeSlotTemplate/${id}`);
	}

}
