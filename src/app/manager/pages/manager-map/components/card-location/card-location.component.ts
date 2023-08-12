import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ModalService } from '@design-system/core';
import { Location, Location_Non_Defined_Name, StaticDataService, User } from '@flex-team/core';
import { Subject } from 'rxjs';
import { ModalUserProfileComponent } from 'src/app/components';

@Component({
  selector: 'fxt-manager-map-card-location',
  templateUrl: './card-location.component.html',
  styleUrls: ['./card-location.component.scss']
})
export class CardLocationComponent implements OnInit, OnChanges, OnDestroy {

  @Input() location: Location;
  @Input() users: User[] = [];
  @Input() currentUser: User;

  @Output() confirmClicked = new EventEmitter<Location>();

  private _destroyed = new Subject<void>();

  hasCurrentUser = false;
  editMode = false;
  canChangeTo = false;

  constructor(
    private modalService: ModalService,
    private staticDataService: StaticDataService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes.users && changes.users.currentValue)
      || (changes.currentUserId)) {
      this.hasCurrentUser = this.users.findIndex((x: User) => x.id == this.currentUser.id) >= 0;
    }

    this.canChangeTo = !this.location.inOffice && this.location.name != Location_Non_Defined_Name
      && !this.hasCurrentUser;

  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  onAvatarClicked(user: User, event: any) {
    event.preventDefault();
    event.stopPropagation();

    if (user.isOnboarded) {
      this.openModalUserProfile(user);
    } else {
      this.launchMailClientToRemind(user);
    }

  }

  toggleEditMode() {
    if (this.canChangeTo) {
      this.editMode = !this.editMode;
    }
  }

  confirm() {
    if (this.canChangeTo) {
      this.confirmClicked.emit(this.location);
      this.editMode = false;
    }
  }

  private launchMailClientToRemind(user: User) {
    const emailToText = this.staticDataService.factoryMailContentToRemindOnboarding(user.email);
    window.location.href = emailToText;
  }

  private openModalUserProfile(user: User) {
    this.modalService.open(ModalUserProfileComponent, {
      width: '550px',
      maxHeight: '85%',
      customClass: 'modal-user-profile',
      data: {
        user: user
      },
    });
  }

}
