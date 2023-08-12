import { Component, OnInit } from '@angular/core';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import {
  AuthenticationService,
  ConfigurationDTO,
  ConfigurationService,
  ConfigurationType, FormatDates, ManagerOrganizationIntegration, MessageService
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { of } from 'rxjs';

@Component({
  selector: 'fxt-company-option',
  templateUrl: './company-option.component.html',
  styleUrls: ['./company-option.component.scss']
})
export class CompanyOptionComponent implements OnInit {

  limitBookingInFuture: number;
  floatingReservations: boolean = false;
  doEditConfig = false;
  IsHalfDaysEnabled: boolean = false;
  formatDate: string;

  availableFormatDates = [
    FormatDates.ddMMyyyy,
    FormatDates.MMddyyyy
  ]

  public options: ManagerOrganizationIntegration[] = [];

  constructor(private authService: AuthenticationService,
    private messageService: MessageService,
    private configurationService: ConfigurationService,
    private translocoService: TranslocoService,
    private modalService: ModalService,) {
    this.limitBookingInFuture = this.authService.limitBookingInFuture;
    this.floatingReservations = this.authService.isFloatingReservationsEnabled;
    this.formatDate = this.authService.formatDate;
  }

  ngOnInit(): void {
    this.options = [
      {
        configurationType: ConfigurationType.IsHalfDaysEnabled,
        name: 'main.half_day',
        isActive: this.authService.isHalfDaysEnabled,
      },
      {
        configurationType: ConfigurationType.IsNeoNomadLayerEnabled,
        name: 'main.neonomad_layer',
        isActive: this.authService.IsNeoNomadLayerEnabled,
      },
    ];

  }

  changeFormatDate(val: string) {
    this.formatDate = val;
    this.authService.updateFormatDate(this.formatDate);
    this.messageService.success();
  }

  changeLimitBooking(event: any) {
    this.doEditConfig = true;
    this.limitBookingInFuture = event;
  }

  onUpdateConfiguration() {
    this.doEditConfig = false;
    const dto = <ConfigurationDTO>{
      type: ConfigurationType.LimitBookingInFuture,
      value: this.limitBookingInFuture.toString()
    };

    this.updateConfiguration(dto);
  }

  onFloatingReservationsChange(event: any) {
    this.doEditConfig = true;
    this.floatingReservations = event;
  }

  onUpdateFloatingReservations() {
    this.doEditConfig = false;
    const dto = <ConfigurationDTO>{
      type: ConfigurationType.FloatingReservations,
      value: this.floatingReservations.toString()
    };

    this.updateConfiguration(dto);
  }

  changeActive(option: ManagerOrganizationIntegration, checked: boolean) {
    this.doEditConfig = false;

    let action$ = of(true);

    if (option.configurationType === ConfigurationType.IsHalfDaysEnabled) {
      const modalRef = this.modalService.open(ModalConfirmationComponent, {
        width: '400px',
        disableClose: true,
        data: {
          message: this.translocoService.translate('organization.flexteam_admin_is_going_to_contact')
        }
      });
      action$ = modalRef.afterClosed$;
    }

    action$.subscribe(ok => {
      if (ok) {

        const dto = <ConfigurationDTO>{
          type: option.configurationType,
          value: checked.toString()
        };

        this.updateConfiguration(dto);
      } else {
        option.isActive = !checked;
      }
    })

  }

  /**
   * Update configuration and update localstorage
   * @param dto 
   */
  private updateConfiguration(dto: ConfigurationDTO) {
    this.configurationService.updateConfiguration(dto)
      .subscribe(_ => {
        this.authService.updateConfiguration(dto, dto.type);
        this.messageService.success();
      })
  }

}
