import { Component, OnInit } from '@angular/core';
import { FxtAnimations } from '../animations';

@Component({
  selector: 'fxt-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  animations: [
    FxtAnimations.openClose
  ]
})
export class DropdownComponent implements OnInit {

  isOpen: Boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }

}
