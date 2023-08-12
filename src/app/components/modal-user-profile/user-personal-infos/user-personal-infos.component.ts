import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import {
  ModalChangeBasicInformationsComponent,
  ModalService, UserAddressComponent
} from '@design-system/core';
import { MessageService, User } from '@flex-team/core';


@Component({
  selector: 'fxt-user-personal-infos',
  templateUrl: './user-personal-infos.component.html',
  styleUrls: ['./user-personal-infos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPersonalInfosComponent implements OnInit {

  @Input() user: User;
  @Input() isCurrentUser = false;

  constructor(
    private modalService: ModalService,
    private messageService: MessageService
  ) {
  }

  ngOnInit() {
  }

  openModalChangeBasicInformations() {
    const modalRef = this.modalService.open(ModalChangeBasicInformationsComponent, {
      width: 'auto',
      data: this.user,
    });

    modalRef.afterClosed$.subscribe(resp => {
      if (resp) {
        this.user = Object.assign({}, this.user, resp);
        this.messageService.success();
      }
    })
  }

  openAddressModal() {
    const modalRef = this.modalService.open(UserAddressComponent, {
      width: 'auto',
      data: this.user.metadata,
    });

    modalRef.afterClosed$.subscribe(resp => {
      if (resp) {
        this.user = Object.assign({}, this.user, {
          metadata: resp
        });
        this.messageService.success();
      }
    })
  }

}
