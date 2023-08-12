import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import { ManagerOfficeService, MessageService, UserPresenceByTimeslotDto, UserPresenceDto, UserPresenceInfo, Workload } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { DateTime } from 'luxon';

@Component({
  selector: 'fxt-manager-office-row-presence-user',
  templateUrl: './row-presence-user.component.html',
  styleUrls: ['./row-presence-user.component.scss']
})
export class ManagerOfficeRowPresenceUserComponent implements OnChanges {

  @Input() office: any;
  @Input() isEditMode: boolean;
  @Input() selectedDate: Date;

  users: UserPresenceDto[] = [];

  constructor(private modalService: ModalService,
    private translocoService: TranslocoService,
    private managerOfficeService: ManagerOfficeService,
    private messageService: MessageService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedDate && changes.selectedDate.currentValue) {
      this.loadUsersForOffice();
    }
  }

  removeUser(office: any, user: any) {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto',
      data: {
        message: this.translocoService.translate('manager.confirm_remove_user_from_presence_list', { userFullName: user.fullName })
      }
    })

    modalRef.afterClosed$.subscribe(isOk => {
      if (isOk) {
        this.managerOfficeService.removeUserFromPresenceList(office.id, DateTime.fromJSDate(this.selectedDate), user.id)
          .subscribe(() => {
            this.messageService.success();
            this.loadUsersForOffice();
          })
      }
    })
  }

  /**
   * Load user presence for office
   */
  private loadUsersForOffice() {
    this.managerOfficeService.loadUsersForOffice(this.office.id, DateTime.fromJSDate(this.selectedDate))
    .subscribe((resp: Workload<UserPresenceInfo>) => {
      this.users = resp.workload.allUsers;
      this.office.actualLoad = this.users.length;
    })
  }

}
