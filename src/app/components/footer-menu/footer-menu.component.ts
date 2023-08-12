import { Component, OnInit } from '@angular/core';
import { ModalService } from '@design-system/core';
import { AuthenticationService, PlatformService, User } from '@flex-team/core';
import { ModalGoogleMapComponent } from '../modal-google-map';
import { ModalUserProfileComponent } from '../modal-user-profile';

@Component({
  selector: 'fxt-footer-menu',
  templateUrl: './footer-menu.component.html',
  styleUrls: ['./footer-menu.component.scss']
})
export class FooterMenuComponent implements OnInit {

  public isManagerInDesktop = false;
  public isMobile = false;

  constructor(
    private platform: PlatformService,
    private authService: AuthenticationService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.isMobile = this.platform.isMobile(window);

    this.authService.currentUser$.subscribe(() => {
      this.isManagerInDesktop = this.authService.userIsManager && !this.isMobile;
    });
  }

  /**
   * Show modal googlemap
   */
  showModalGoogleMap() {
    const modalRef = this.modalService.open(ModalGoogleMapComponent, {
      height: '90%',
      data: {
        selectedDate: new Date()
      }
    });

    modalRef.afterClosed$.subscribe(_ => {
    })
  }

  /**
   * Open current user profile popup
   * @param user 
   */
  openCurrentUserProfilePopup() {

    this.modalService.open(ModalUserProfileComponent, {
      width: '90%',
      maxHeight: '85%',
      customClass: 'modal-user-profile',
      data: {
        user: this.authService.currentUser,
        hideScheduler: true
      },
    });
  }

}
