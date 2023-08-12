import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FxtAnimations } from '@design-system/core';
import {
  AuthenticationService,
  Location, LocationService, Notification, NotificationService,
  NotificationType, PlatformService, StaticDataService, User
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { DateTime } from 'luxon';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import SwiperCore, { Navigation, SwiperOptions } from 'swiper';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [FxtAnimations.fadeOut]
})
export class DashboardComponent implements OnInit, OnDestroy {

  public todayDate: DateTime = DateTime.now();
  public tomorowDate: DateTime = DateTime.now().plus({ days: 1 });

  public notifications: Notification[] = [];
  public locations: Location[] = [];
  public coreTeam: string = '';

  public days: DateTime[] = [];
  public dayTitles: string[] = [];

  private _currentLang: string;

  public swiperOptions: SwiperOptions = {
    slidesPerView: 1,
    spaceBetween: -100,
    threshold: 20,
    navigation: false
  }

  currentUser: User;

  private _destroyed = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private staticDataService: StaticDataService,
    private router: Router,
    private locationService: LocationService,
    private translocoService: TranslocoService,
    private authService: AuthenticationService,
    private platformService: PlatformService) {
    this._currentLang = this.translocoService.getActiveLang();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  

}
