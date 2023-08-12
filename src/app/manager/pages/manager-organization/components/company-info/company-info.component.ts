import { Component, OnInit } from '@angular/core';
import { ModalLocationMetadataComponent, ModalConfig, ModalConfirmationComponent, ModalService } from '@design-system/core';
import { AuthenticationService, CompanyInfo, ManagerOrganizationService, MessageService, WorkingStatus } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { SortableEvent } from 'sortablejs';
import { ManagerOrganizationModalAddWorkingStatusComponent } from '../modals';

@Component({
  selector: 'fxt-company-info',
  templateUrl: './company-info.component.html',
  styleUrls: ['./company-info.component.scss']
})
export class CompanyInfoComponent implements OnInit {

  public companyInfo: CompanyInfo = new CompanyInfo();
  workingStatuses: WorkingStatus[];
  companyId: string;
  companyName: string;

  public isAdding = false;
  selectedLocationId: string;

  configModal: ModalConfig = {
    width: 'auto',
    height: 'auto',
    disableClose: true,
  };

  onEndSortFn: (event: SortableEvent) => void;
  sortablejsOptions: any;

  constructor(
    private managerOrganizationService: ManagerOrganizationService,
    private messageService: MessageService,
    private modalService: ModalService,
    private translocoService: TranslocoService,
    private authService: AuthenticationService
  ) {
    this.onEndSortFn = this.onEndSort.bind(this);
    this.companyId = this.authService.currentUser.idCompany;
    this.companyName = this.authService.currentUser.companyName;

    this.sortablejsOptions = {
      onEnd: this.onEndSortFn,
      handle: '.btn-sort-handle'
    }
  }

  ngOnInit() {
    this.getWorkingStatus();
    this.getApprovedDomains();
  }

  private getWorkingStatus() {
    this.managerOrganizationService.getWorkingStatus(this.companyId).subscribe(resp => {
      this.workingStatuses = resp.workload;
    })
  }

  onIconDeleteClicked(id: string) {
    if (!id) return;

    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto',
      disableClose: true,
    });

    modalRef.afterClosed$.subscribe(ok => {
      if (ok) {
        this.removeStatus(id);
      }
    })

  }

  openModalAddOrUpdateWorkingStatus(model?: WorkingStatus) {
    const config = { ...this.configModal, escToClose: true };
    config.data = {
      ...model,
      name: model?.name,
      isRemoteWork: model?.isRemoteWork == null ? false : model.isRemoteWork
    };
    const modalRef = this.modalService.open(ManagerOrganizationModalAddWorkingStatusComponent, config);
    modalRef.afterClosed$.subscribe((data: WorkingStatus) => {
      if (data) {
        this.getWorkingStatus();
      }
    });
  }

  openModalAddOrUpdateLocationMetatadata(model?: WorkingStatus) {
    const config = { ...this.configModal, width: '600px', escToClose: true };
    config.data = model;

    const modalRef = this.modalService.open(ModalLocationMetadataComponent, config);
    modalRef.afterClosed$.subscribe((data: WorkingStatus) => {
      if (data) {
        this.getWorkingStatus();
      }
    });
  }

  private removeStatus(id: string) {
    this.managerOrganizationService.deleteWorkingStatus(id, this.companyId).subscribe(resp => {
      this.getWorkingStatus();
      this.messageService.success();
    })
  }

  private onEndSort(event: SortableEvent) {
    if (event.oldIndex === event.newIndex) {
      return;
    }

    const payload = {
      locations: this.workingStatuses.map((x, index) => {
        return { id: x.id, orderInList: index };
      })
    }

    this.managerOrganizationService.reorderWorkingStatus(payload).subscribe((resp) => {
      this.getWorkingStatus();
    });
  }

  onChangeDomain(e: any) {
    const { target: { value } } = e;
    let domain = value.trim();
    if (domain !== '') {
        this.companyInfo.approvedDomains.push(domain);
        this.isAdding = false;
        this.updateCompanyInfo();
    }
  }

  removeDomain(index: number) {
    this.companyInfo.approvedDomains.splice(index, 1);
    this.updateCompanyInfo();
  }

  openDialogRemoveDomain(index: number) {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto',
      disableClose: true,
      data: {
        message: this.translocoService.translate('organization.delete_domains', { name: this.companyInfo.approvedDomains[index] })
      }
    });

    modalRef.afterClosed$.subscribe(ok => {
      if (ok) {
        this.removeDomain(index);
      }
    })
  }

  updateCompanyInfo() {
    this.managerOrganizationService.updateApprovedDomains(this.companyId, this.companyInfo.approvedDomains).subscribe(r => {
      if (r.statusCode == 406) {
        this.messageService.warn('organization.public_domain_not_allowed');
        this.companyInfo.approvedDomains.pop();
      } else {
        this.messageService.success('organization.update_success');
      }
    })
  }

  getApprovedDomains(){
    this.managerOrganizationService.getApprovedDomain(this.companyId).subscribe(r => {
      this.companyInfo.approvedDomains = r.workload;
      })
  }
}
