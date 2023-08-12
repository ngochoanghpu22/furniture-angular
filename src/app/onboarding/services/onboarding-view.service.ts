import { Injectable } from '@angular/core';
import { AuthenticationResult } from '@azure/msal-browser';
import { AuthProvider, InviteUser, Location, Onboarding } from '@flex-team/core';
import { SocialUser } from 'angularx-social-login';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable()
export class OnboardingViewService {

  public onboardingToken: string = "";
  public password: string = "";
  public selectedLocation: Location[] = Array(5).fill(new Location());
  public hierarchyTeamName: string;
  public hierarchyTeam: InviteUser[] = [];
  public provider: AuthProvider = AuthProvider.None;

  public externalResult: AuthenticationResult | SocialUser;

  set onboarding(val: Onboarding) {

    this.selectedLocation[0] = val.monday;
    this.selectedLocation[1] = val.tuesday;
    this.selectedLocation[2] = val.wednesday;
    this.selectedLocation[3] = val.thursday;
    this.selectedLocation[4] = val.friday;

    this._onboardingSubject.next(val);

  }

  get onboarding(): Onboarding {
    return this._onboardingSubject.value;
  }

  public updatePersoInfos(data: any, externalResult: AuthenticationResult | SocialUser,
    provider: AuthProvider = AuthProvider.None) {
    const onboarding = this.onboarding;

    onboarding.owner.firstName = data.firstName;
    onboarding.owner.lastName = data.lastName;
    onboarding.owner.fullName = data.fullName;

    this.provider = provider;
    this.password = data.password;

    this.externalResult = externalResult;

    this.onboarding = onboarding;
  }

  private _onboardingSubject: BehaviorSubject<Onboarding> = new BehaviorSubject<Onboarding>(new Onboarding());

  public onboarding$: Observable<Onboarding> = this._onboardingSubject.asObservable();


  constructor() {
  }




}
