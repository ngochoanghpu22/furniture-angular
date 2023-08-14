import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from 'src/app/profile/profile.service';
import { LocalStorageService } from '../../service/localStorage.service';
import { AppSettings } from '../../constant/appSetting';

declare var $:any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  //providers: [ProfileService, LocalStorageService]
})
export class NavbarComponent implements OnInit, OnDestroy {
  numOfItem = 9;
  title = 'furniture';
  profile: any = {};
  isSignedIn = false;

  constructor(private profileService: ProfileService, 
              private modalService: NgbModal,
              private localStorageService: LocalStorageService) {    
    
  }

  ngOnInit() {
      this.getProfile();

      this.profileService.selectedProfile$.subscribe(data => {
        let a = data;
      });
  }

  getProfile() {
    let data = this.localStorageService.getItem(AppSettings.STORAGE.Profile);
    if (data) {
      this.afterSignedIn(data);
    }
  }

  open(content: any, event: any) {
    this.getProfile();
    this.gotoPage(event);
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      
    });
  }

  signOut() {
    this.profile = {};
    $(".sign-in").show();
    $(".sign-out").hide();
    $(".welcome, .profile").addClass("d-none");
    localStorage.removeItem("profile");

    $("a.nav-link").removeClass("nav-link_active");
    $("li.sign-in").find("a").addClass("nav-link_active");
  }

  afterSignedIn(data: any) {
    let myProfile = JSON.parse(data);
    this.profile['name'] = myProfile.name;
    this.profile['email'] = myProfile.email;
    this.profile['phone'] = myProfile.phone;
    this.profile['role'] = myProfile.role;

    $(".sign-in").hide();
    $(".sign-out").show();
    $(".welcome, .profile").removeClass("d-none");
    $(".welcome-user").text(myProfile.name);
    $("li.nav-item.sign-out").removeClass("d-none");
  }

  gotoPage(event: any) {
    $("a.nav-link").removeClass("nav-link_active");
    $(event.currentTarget).addClass("nav-link_active");
  }



  ngOnDestroy() {
    
  }
}
