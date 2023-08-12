import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AppConfig } from './workloads';

const CONFIG_LOCATION = "/config.json";

@Injectable()
export class AppConfigService {

  public config: AppConfig;
  public googleMapLoaded = false;

  parisCoordinates = { lat: 48.8584, lng: 2.2945 };

  constructor(private http: HttpClient) { }

  loadAppConfig(): Promise<AppConfig> {
    return this.http.get<AppConfig>(CONFIG_LOCATION)
      .pipe(map(resp => {
        console.info('APP CONFIGURATION loaded');
        this.config = resp;
        return resp;
      })).toPromise();
  }

}
