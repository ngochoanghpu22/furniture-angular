import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import {
  AddEditWorkingPolicyDTO, ManagerOrganizationService,
  MessageService, ProfileService, SelectionItem, StaticDataService, Team,
  User, Workload
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

type WorkingPolicyOption = { id: string, name: string };

@Component({
  selector: 'fxt-user-work-details',
  templateUrl: './user-work-details.component.html',
  styleUrls: ['./user-work-details.component.scss']
})
export class UserWorkDetailsComponent implements OnInit, OnChanges {

  @Input() user: User;
  @Input() canEditWorkingProfile: boolean;
  @Input() coreTeams: Team[];
  @Input() groupTeams: Team[] = [];

  @Output() policyChanged = new EventEmitter<string>();

  public workingPolicies: WorkingPolicyOption[] = [];
  public currentUserId: string;

  selectedWorkingPolicyId: string;
  coreTeamSelectionItems: SelectionItem[] = [];

  constructor(
    private managerOrganizationService: ManagerOrganizationService,
    private profileService: ProfileService,
    private messageService: MessageService,
    private modalService: ModalService,
    private translocoService: TranslocoService,
    private staticDataService: StaticDataService
  ) {

  }

  ngOnInit() {
    this.selectedWorkingPolicyId = this.user.workingPolicyId || '';
    this.getWorkingPolicies();
    this.currentUserId = this.user.id;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.coreTeams) {
      this.coreTeamSelectionItems = this.coreTeams.map(x => new SelectionItem(x))
    }
  }

  public tryUpdateWorkingPolicy(selectedWpId: string) {

    if (!this.canEditWorkingProfile || this.user.workingPolicyId == selectedWpId) return;

    const dto = <any>{
      userId: this.user.id,
      workingPolicyId: selectedWpId
    }
    this.checkCompatibilityWorkingPolicyWithDefaultWeek(dto);
  }

  // it will execute from dropdown change
  private updateUserWorkingPolicy(dto: any) {

    if (!dto.workingPolicyId) dto.workingPolicyId = null;

    this.profileService.updateUserWorkingPolicy(dto).subscribe(resp => {
      if (resp.errorCode == 'OK') {
        this.user.workingPolicyId = dto.workingPolicyId;
        this.policyChanged.emit(dto.workingPolicyId);
        this.messageService.success('user_profile.work_profile_policy_save_success');
        if (dto.workingPolicyId != null) {
          this.staticDataService.notifyUserProfileChanged();
        }
      } else {
        this.messageService.error('user_profile.work_profile_policy_save_fail');
      }
    })
  }

  private getWorkingPolicies() {
    this.managerOrganizationService.getWorkingPolicies()
      .subscribe((resp: Workload<AddEditWorkingPolicyDTO[]>) => {
        this.workingPolicies = resp.workload;
      })
  }

  private checkCompatibilityWorkingPolicyWithDefaultWeek(dto: any) {
    this.profileService.checkCompatibilityWorkingPolicyWithDefaultWeek(dto)
      .pipe(switchMap((resp) => {
        if (resp.workload) {
          return of(true);
        } else {
          const modalRef = this.modalService.open(ModalConfirmationComponent, {
            width: '400px',
            data: {
              message: this.translocoService.translate('message_warning_booking_location.changing_working_policy_not_compatible_default_week_by_manager')
            }
          });
          return modalRef.afterClosed$;
        }
      })).subscribe(isOK => {
        if (isOK) {
          this.updateUserWorkingPolicy(dto);
        } else {
          this.selectedWorkingPolicyId = this.user.workingPolicyId || '';
        }
      })
  }
}
