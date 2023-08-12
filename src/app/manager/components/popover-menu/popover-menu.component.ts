import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import { AuthenticationService, AuthProvider, User } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { ModalUserProfileComponent } from 'src/app/components';
import { UserService } from 'src/app/core/services/user-service/user.service';
import { Role } from 'src/app/core/services/workloads/enums/role.enum';

@Component({
  selector: 'fxt-manager-popover-menu',
  templateUrl: './popover-menu.component.html',
  styleUrls: ['./popover-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagerPopoverMenuComponent implements OnInit {

  @Input() user: any;

  loading = false;

  isShowMyTasks = false;
  isShowBalance = false;

  @Output() actionClicked: EventEmitter<void> = new EventEmitter();
  version = (<any>window).INTERNAL_Version.version;

  constructor(private authService: AuthenticationService,
    private translocoService: TranslocoService,
    private userService: UserService,
    private cd: ChangeDetectorRef,
    private router: Router,
    private modalService: ModalService) { }

  ngOnInit() {
    const currentUser = this.user;
    
    this.isShowMyTasks = currentUser.role == Role.User || currentUser.role == Role.Client;
    this.isShowBalance = currentUser.role == Role.User || currentUser.role == Role.Client;
  }

  logout() {

    this.actionClicked.emit();

    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto',
      disableClose: true,
      data: {
        message: this.translocoService.translate('main.are_you_sure_logout')
      }
    });

    modalRef.afterClosed$.subscribe((ok) => {
      if (ok) {
        this.authService.logout(AuthProvider.None);
        this.router.navigate(['/login']);
      }
    });
  }

  gotoMyPickedTask() {
    this.actionClicked.emit();
    this.router.navigate(['manager/my-picked-task']);
  }

  gotoMyOwnTask() {
    this.actionClicked.emit();
    this.router.navigate(['manager/my-own-task']);
  }

  getProifile() {
    const userId = this.authService.currentUser?.id;
    this.userService
      .getProfile(userId)
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.user = data.resultObj;
          this.cd.detectChanges();
          return data.resultObj;
        },
        (error) => {
        }
      );
  }

  openUserProfilePopup($event: Event) {

    $event.preventDefault();
    $event.stopPropagation();

    const modalRef = this.modalService.open(ModalUserProfileComponent, {
      width: '550px',
      maxHeight: '85%',
      customClass: 'modal-user-profile',
      data: {
        user: this.user
      },
    });

    this.actionClicked.emit();

  }
}
