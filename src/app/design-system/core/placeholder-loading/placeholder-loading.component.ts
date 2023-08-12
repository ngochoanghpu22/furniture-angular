import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'fxt-placeholder-loading',
  template: `<div class="placeholder">
  <div [style.height.px]="height" class="animated-background"></div>
</div>`,
  styleUrls: ['./placeholder-loading.component.scss']
})
export class PlaceholderLoadingComponent implements OnInit {

  @Input() height: number = 50;

  constructor() { }

  ngOnInit() {
  }

}
