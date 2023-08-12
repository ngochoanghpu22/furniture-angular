import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import {
  AddEditWorkingPolicyDTO, FileService, ManagerOrganizationService,
  MessageService, Workload
} from '@flex-team/core';
import { ColumnMode, SelectionType, TableColumn } from '@swimlane/ngx-datatable';
import { WorkingPolicyModalComponent } from '../working-policy-modal/working-policy-modal.component';

@Component({
  selector: 'fxt-working-policy',
  templateUrl: './working-policy.component.html',
  styleUrls: ['./working-policy.component.scss']
})
export class WorkingPolicyComponent implements OnInit {

  @ViewChild('checkTmp', { static: true })
  checkTmp: TemplateRef<any> | null = null;

  public workingPolicies: AddEditWorkingPolicyDTO[];
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  columns: TableColumn[];

  constructor(
    private modalService: ModalService,
    private messageService: MessageService,
    private managerOrganizationService: ManagerOrganizationService,
    private fileService: FileService
  ) {
  }

  ngOnInit() {
    this.getWorkingPolicies();

    this.columns = [
      { name: 'organization.profile_name', prop: 'name', sortable: true },
      {
        name: 'organization.userCountLabel', prop: 'numberOfUsers',
        sortable: true, cellClass: 'column-number'
      },
      {
        name: 'organization.limitRemoteDaysPerWeek', prop: 'maxNumberOfRemoteDaysPerWeek',
        sortable: true, cellClass: 'column-number'
      },
      {
        name: 'organization.limitOfficeDaysPerWeek', prop: 'maxNumberOfOfficeDaysPerWeek',
        sortable: true, cellClass: 'column-number'
      },
      {
        name: 'organization.limitRemoteDaysPerMonth', prop: 'maxNumberOfRemoteDaysPerMonth',
        sortable: true, cellClass: 'column-number'
      },
      {
        name: 'organization.allowRemoteException', prop: 'isAllowRemoteExceptionEnabled',
        sortable: true, cellTemplate: this.checkTmp, cellClass: 'column-number'
      },
    ];
  }

  showProfileModal(profile?: AddEditWorkingPolicyDTO) {
    const modalRef = this.modalService.open(WorkingPolicyModalComponent, {
      width: '400px',
      disableClose: true,
      data: profile
    })

    modalRef.afterClosed$.subscribe(r => {
      if (r) {
        this.getWorkingPolicies();
      }
    });
  }

  getExcelUsersAndProfile() {
    this.managerOrganizationService.getExcelUsersAndProfile()
      .subscribe(s => {
        this.fileService.downloadFile(s, "UsersAndProfile.xlsx");
      });
  }

  tryDelete(item: AddEditWorkingPolicyDTO) {
    if (this.workingPolicies.length <= 1) return;

    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto',
      disableClose: true,
    });

    modalRef.afterClosed$.subscribe(ok => {
      if (ok) {
        this.deletePolicy(item);
      }
    })

  }

  private getWorkingPolicies() {
    this.managerOrganizationService.getWorkingPolicies()
      .subscribe((resp: Workload<AddEditWorkingPolicyDTO[]>) => {
        this.workingPolicies = resp.workload;
      })
  }

  private deletePolicy(item: AddEditWorkingPolicyDTO) {
    this.managerOrganizationService.deleteWorkingPolicy(item.id)
      .subscribe(resp => {
        this.getWorkingPolicies();
        this.messageService.success('organization.delete_success');
      })
  }

}
