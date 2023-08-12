import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fxt-manager-block-developers',
  templateUrl: './block-developers.component.html',
  styleUrls: ['./block-developers.component.scss']
})
export class ManagerBlockDevelopersComponent implements OnInit {

  public userInfos = [
    { name: 'Beth Davis' }
  ];

  constructor() { }

  ngOnInit() {
  }

}
