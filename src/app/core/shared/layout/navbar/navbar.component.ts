import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from 'src/app/profile/profile.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  providers: [ProfileService]
})
export class NavbarComponent implements OnInit {
  numOfItem = 9;
  title = 'furniture';
  profile: any = {};

  constructor(private profileService: ProfileService, private modalService: NgbModal) {    
    
  }

  ngOnInit() {
      this.getProfile();

      this.profileService.selectedProfile$.subscribe(data => {
        let a = data;
      });
  }

  getProfile() {
    let data = localStorage.getItem("profile");
    if (data) {
      let myProfile = JSON.parse(data);
      this.profile['name'] = myProfile.name;
      this.profile['email'] = myProfile.email;
      this.profile['phone'] = myProfile.phone;
      this.profile['role'] = myProfile.role;
    }
  }

  open(content:any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      
    });
  }
}
