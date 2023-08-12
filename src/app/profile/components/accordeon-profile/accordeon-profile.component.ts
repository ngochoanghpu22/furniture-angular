import { Component, Input, OnInit } from '@angular/core';
import { FxtAnimations } from '@design-system/core';

@Component({
  selector: 'app-accordeon-profile',
  templateUrl: './accordeon-profile.component.html',
  styleUrls: ['./accordeon-profile.component.scss'],
  animations: [
    FxtAnimations.rotate
  ]
})
export class AccordeonProfileComponent implements OnInit {

  @Input() showContent: boolean = false;
  @Input() title: string = '';
  @Input() icon: string = '';

  constructor() { }

  ngOnInit() {
  }

}
