import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BaseApiService } from './base-api.service';
import { AuthProvider } from './workloads/enums';
import { Onboarding } from './workloads/Onboarding';
import { Workload } from './workloads/Workload';

@Injectable()
export class OnboardingService extends BaseApiService {
  onboarding: Onboarding;
  constructor(protected http: HttpClient) {
    super(http);
  }

  public getOnboarding(onboardingToken: string) {
    return this.http
      .post<Workload<Onboarding>>(this.accessPointUrl + '/api/Onboarding/GetOnboarding',
        {},
        { headers: { "onboarding": onboardingToken } }).pipe(
          map(r => r.workload),
          tap(data => {
            this.onboarding = data;
          })
        );
  }

  public saveOnboarding(onboarding: Onboarding,
    hierarchyTeamName: string, password: string,
    onboardingToken: string, provider: AuthProvider): Observable<Workload<Onboarding>> {
    return this.http
      .post<Workload<Onboarding>>(this.accessPointUrl + '/api/Onboarding/SaveOnboarding',
        {
          onboarding,
          password,
          hierarchyTeamName,
          provider
        },
        { headers: { "onboarding": onboardingToken } });
  }

  public transformSelectionToFavoriteTeam(onboardingToken: string) {
    return this.http
      .post<Workload<Onboarding>>(this.accessPointUrl + '/api/Onboarding/TransformSelectionToFavoriteTeam',
        {},
        { headers: { "onboarding": onboardingToken } });
  }
}
