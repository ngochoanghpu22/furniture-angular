import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MsalModule, MsalService } from '@azure/msal-angular';
import {
  CheckboxWithTooltipWrapper, CustomFormlyFieldModule,
  CustomMulticheckboxWithTooltipWrapper,
  QuickPlayDataProvider, TranslocoRootModule
} from '@design-system/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { FormlyModule } from '@ngx-formly/core';
import { SocialLoginModule } from 'angularx-social-login';
import { AvatarModule } from 'ngx-avatar';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { frLocale } from 'ngx-bootstrap/locale';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SortablejsModule } from 'ngx-sortablejs';
import { ToastrModule } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  FooterMenuComponent, LocationProviderService,
  ModalGoogleMapModule,
  ModalUserProfileModule
} from './components';
import { AppConfigService, CoreModule, QuickPlayDataService } from './core';
import { DesignSystemModule } from './design-system';
import { ProcessingLocationService } from './processing-location.service';

defineLocale('fr', frLocale);
registerLocaleData(localeFr);

export function AppConfigFactory(configService: AppConfigService) {
  return () => configService.loadAppConfig();
}

export function roleFieldGroupRequiredValidator(control: AbstractControl) {
  if (Object.values(control.value).some((field) => !!field)) {
    return null;
  }
  return { roleFieldGroupRequired: { message: 'This field is required' } };
}


@NgModule({
  declarations: [
    AppComponent,
    FooterMenuComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    PopoverModule.forRoot(),
    CoreModule.forRoot(),
    SortablejsModule.forRoot({
      animation: 300,
    }),
    ToastrModule.forRoot(),
    TooltipModule.forRoot(),

    DesignSystemModule,
    FormlyModule.forRoot({
      extras: { lazyRender: true },
      validators: [
        { name: 'roleFieldGroupRequired', validation: roleFieldGroupRequiredValidator },
      ],
      wrappers: [
        { name: 'checkbox-tooltip-wrapper', component: CheckboxWithTooltipWrapper },
        { name: 'custom-multicheckbox-with-tooltip-wrapper', component: CustomMulticheckboxWithTooltipWrapper },
      ],
    }),
    FormlyBootstrapModule,
    TranslocoRootModule,
    AvatarModule,
    MsalModule,
    SocialLoginModule,
    CustomFormlyFieldModule,
    ModalUserProfileModule,
    ModalGoogleMapModule
  ],
  providers: [
    {
      provide: QuickPlayDataProvider,
      useClass: QuickPlayDataService
    },
    {
      provide: LocationProviderService,
      useExisting: ProcessingLocationService
    },
    MsalService,
    { provide: LOCALE_ID, useValue: environment.defaultLocaleId },
    {
      provide: APP_INITIALIZER,
      useFactory: AppConfigFactory,
      deps: [AppConfigService],
      multi: true
    },
    ProcessingLocationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
