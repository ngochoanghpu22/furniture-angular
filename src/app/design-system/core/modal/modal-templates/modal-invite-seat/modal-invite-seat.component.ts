import { Component, OnInit } from '@angular/core';
import {
  AuthenticationService, Guid_Empty,
  SeatInvitedEvent, Team, User
} from '@flex-team/core';
import { ModalConfig } from '../../modal-config';
import { ModalRef } from '../../modal-ref';

@Component({
  selector: 'fxt-modal-invite-seat',
  templateUrl: './modal-invite-seat.component.html',
  styleUrls: ['./modal-invite-seat.component.scss']
})
export class ModalInviteSeatComponent implements OnInit {

  team: Team = new Team();
  data: SeatInvitedEvent;
  formatDate: string;
  selectedUser: User;

  constructor(
    private config: ModalConfig,
    private modalRef: ModalRef,
    private authService: AuthenticationService
  ) {
    this.team.id = Guid_Empty;
    this.data = this.config.data;
    this.formatDate = this.authService.formatDate;
  }

  ngOnInit() {
  }

  onUserSelected($event: User) {
    this.selectedUser = $event;
  }

  confirm() {
    if (!this.selectedUser) return;
    this.close(this.selectedUser);
  }

  close(res: any) {
    this.modalRef.close(res);
  }

}
