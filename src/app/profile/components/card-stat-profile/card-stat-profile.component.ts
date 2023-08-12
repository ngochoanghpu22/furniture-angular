import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card-stat-profile',
  templateUrl: './card-stat-profile.component.html',
  styleUrls: ['./card-stat-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardStatProfileComponent implements OnInit {

  @Input() title: string = '';
  @Input() time: string = '';
  @Input() percentage: string = ';';

  @Input() set down(val: boolean){
    this._down = val;
  }
  _down: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
