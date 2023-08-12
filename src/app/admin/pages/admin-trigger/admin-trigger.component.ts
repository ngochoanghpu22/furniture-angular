import { Component, OnInit } from '@angular/core';
import { AdminService, AuthenticationService, Company } from '@flex-team/core';
import { ModalConfirmationComponent, ModalService } from '../../../design-system/core';
import { AdminCompanyViewService } from '../../services/admin-company-view.service';

@Component({
  selector: 'app-admin-trigger',
  templateUrl: './admin-trigger.component.html',
  styleUrls: ['./admin-trigger.component.scss'],
  providers: [AdminCompanyViewService]
})
export class AdminTriggerComponent implements OnInit {

  selectedCompany: Company | null;

  constructor(
    private adminCompanyViewService: AdminCompanyViewService,
    private adminService: AdminService,
    private modalService: ModalService  ) {

  }

  ngOnInit() {
    this.adminCompanyViewService.company$.subscribe(data => {
      this.selectedCompany = data;
    })
  }

  executeTriggerSlackSelection() {
    this.adminService.weeklySlackReminder().subscribe();
  }

  executeTriggerLastSeat() {
    this.adminService.lastSeatBooking().subscribe();
  }

  executeSegmentLogged() {
    this.adminService.segmentLogged().subscribe((c) => {
      const modalRef = this.modalService.open(ModalConfirmationComponent, {
        width: '400px',
        data: {
          message: c + ' user impacted',
          forceConfirm: false
        }
      });
      return modalRef.afterClosed$;
    });
  }
  executeSegmentArchived() {
    this.adminService.segmentArchived().subscribe((c) => {
      const modalRef = this.modalService.open(ModalConfirmationComponent, {
        width: '400px',
        data: {
          message: c + ' user impacted',
          forceConfirm: false
        }
      });
      return modalRef.afterClosed$;
    });
  }
  executeSegmentAdded() {
    this.adminService.segmentAdded().subscribe((c) => {
      const modalRef = this.modalService.open(ModalConfirmationComponent, {
        width: '400px',
        data: {
          message: c + ' user impacted',
          forceConfirm: false
        }
      });
      return modalRef.afterClosed$;
    });
  }

  executeAllBuildingSynchro() {
    this.adminService.buildingSynchro().subscribe((c) => {
      const modalRef = this.modalService.open(ModalConfirmationComponent, {
        width: '400px',
        data: {
          message: c + ' companies impacted',
          forceConfirm: false
        }
      });
      return modalRef.afterClosed$;
    });
  }

}
