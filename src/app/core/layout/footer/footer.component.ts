import { Component, OnDestroy, OnInit } from '@angular/core';

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
