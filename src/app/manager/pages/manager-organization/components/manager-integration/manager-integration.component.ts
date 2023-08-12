import { Component, OnInit } from '@angular/core';
import {
  AuthenticationService, AuthProvider, ManagerOrganizationIntegration,
  ManagerOrganizationService, MessageService, ConfigurationService, ConfigurationDTO, ConfigurationType, OrganizationType
} from '@flex-team/core';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'fxt-manager-integration',
  templateUrl: './manager-integration.component.html',
  styleUrls: ['./manager-integration.component.scss']
})
export class ManagerIntegrationComponent implements OnInit {

  isSlackEnabled: boolean = false;
  isTeamsEnabled: boolean = false;
  isBambooHREnabled: boolean = false;
  isLuccaEnabled: boolean = false;
  isWorkDayEnabled: boolean = false;  
  isPayFitEnabled: boolean = false; 
  isCegedimSRHEnabled: boolean = false;
  isSuccessFactorEnabled: boolean = false;
  doEditConfig = false;

  public integrations: ManagerOrganizationIntegration[] = [];

  loading = false;
  authProvider: AuthProvider;

  AuthProviderEnum = AuthProvider;
  OrganizationTypeEnum = OrganizationType;

  constructor(
    private authService: AuthenticationService,
    private managerOrganizationService: ManagerOrganizationService,
    private messageService: MessageService,
    private configurationService: ConfigurationService
  ) {
    this.authProvider = this.authService.currentUser.authProvider;
  }

  ngOnInit() {
    this.getData();
  }

  changeActive(integration: ManagerOrganizationIntegration, checked: boolean) {
    integration.isActive = checked;
    this.doEditConfig = false;
    this.authUpdateConfiguration(integration.configurationType, checked.toString());
    this.managerOrganizationService.updateIntegration(integration).subscribe(r => {
    })
  }

  getData() {
    this.managerOrganizationService.getIntegrations().subscribe(r => {
      this.integrations = r.workload;
    })
  }

  authUpdateConfiguration(confType: ConfigurationType, isChecked: string) {
    const dto = <ConfigurationDTO>{
      type: confType,
      value: isChecked
    };

    this.configurationService.updateConfiguration(dto)
      .subscribe(_ => {
        this.authService.updateConfiguration(dto, confType);
        this.messageService.success();
      })
  }

}
