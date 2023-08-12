import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ModalService } from '@design-system/core';
import { StaticDataService, User } from '@flex-team/core';
import { Subject } from 'rxjs';
import { ModalUserProfileComponent } from 'src/app/components';

@Component({
  selector: 'fxt-setting-card-user',
  templateUrl: './card-user.component.html',
  styleUrls: ['./card-user.component.scss']
})
export class SettingCardUserComponent implements OnInit, OnDestroy {

  @Input() user: User;
  @Input() disableRemove: boolean;
  @Input() isChief: boolean;
  @Input() currentUser: User;

  @Output() remove: EventEmitter<User> = new EventEmitter<User>();

  private _destroyed = new Subject<void>();

  constructor(
    private modalService: ModalService,
    private staticDataService: StaticDataService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  onRemoveClick(event: any) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.disableRemove) {
      this.remove.emit(this.user);
    }
  }

  onCardClicked(user: User, $event: any) {
    if (user.isOnboarded) {
      this.openUserProfilePopup(user, $event);
    } else {
      this.launchMailClientToRemind(user);
    }
  }

  private launchMailClientToRemind(user: User) {
    const emailToText = this.staticDataService.factoryMailContentToRemindOnboarding(user.email);
    window.location.href = emailToText;
  }

  private openUserProfilePopup(user: User, $event: any) {
    this.modalService.open(ModalUserProfileComponent, {
      width: '550px',
      maxHeight: '85%',
      customClass: 'modal-user-profile',
      data: {
        user: user
      },
    });

    $event.preventDefault();
    $event.stopPropagation();
  }

}
