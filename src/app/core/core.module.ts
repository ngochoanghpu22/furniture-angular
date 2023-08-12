import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ModuleWithProviders, NgModule, Optional, SkipSelf } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  AdminGuard, LoginGuard, ManagerAdminGuard, ManagerDirectoryGuard,
  ManagerGuard, ManagerMapGuard, ManagerOfficeGuard,
  ManagerOrganizationGuard, ManagerStatsGuard,
  ManagerSuperAdminGuard,
  OnboardingGuard, ResetPasswordGuard, SelectPlanGuard
} from './guards';
import { AuthInterceptor, ConnectInterceptor } from './interceptors';
import { PlanSelectDayResolver } from './resolvers';
import {
  AdminService, AppConfigService, AuthenticationService,
  ConfigurationService, FileService, LocationService, ManagerCalendarService,
  ManagerDirectoryService,
  ManagerMapViewService,
  ManagerMeetingService, ManagerOfficeService,
  ManagerOrganizationService, ManagerSeatService, ManagerSettingService,
  ManagerStatsService,
  ManagerViewService,
  MessageService,
  NotificationService, OnboardingService,
  PlanService, PlatformService, ProfileService, SelectionService,
  StaticDataService,
  TimeslotTemplateService
} from './services';

const services: any[] = [
  AuthenticationService,
  FileService,
  LocationService,
  NotificationService,
  OnboardingService,
  PlanService,
  ProfileService,
  SelectionService,
  StaticDataService,
  ManagerOfficeService,
  PlatformService,
  ManagerCalendarService,
  ManagerSettingService,
  ManagerOrganizationService,
  AdminService,
  ManagerStatsService,
  PlanSelectDayResolver,
  ManagerSeatService,
  MessageService,
  ManagerMeetingService,
  AppConfigService,
  ConfigurationService,
  ManagerDirectoryService,
  TimeslotTemplateService,

  ManagerViewService,
  ManagerMapViewService
];

const interceptors: any[] = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ConnectInterceptor,
    multi: true
  }

];

const guards: any[] = [
  LoginGuard,
  OnboardingGuard,
  SelectPlanGuard,
  ManagerGuard,
  ManagerOfficeGuard,
  ManagerSuperAdminGuard,
  ManagerAdminGuard,
  ManagerOrganizationGuard,
  ManagerStatsGuard,
  ManagerMapGuard,
  ManagerDirectoryGuard,
  AdminGuard,
  ResetPasswordGuard
]

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only');
    }
  }
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        ...services,
        ...interceptors,
        ...guards
      ]
    };
  }
}
