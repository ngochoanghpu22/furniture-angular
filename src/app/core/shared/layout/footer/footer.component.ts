import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from 'src/app/profile/profile.service';

declare var $:any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  numOfItem = 9;
  title = 'furniture';
  profile: any = {};
  isSignedIn = false;

  constructor() {
    
  }

  ngOnInit() {
    
  }
}
