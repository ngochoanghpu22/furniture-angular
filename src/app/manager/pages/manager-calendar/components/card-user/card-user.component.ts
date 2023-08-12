import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PROFILE_IMG } from '@design-system/core';

@Component({
  selector: 'fxt-manager-card-user',
  templateUrl: './card-user.component.html',
  styleUrls: ['./card-user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManagerCardUserComponent implements OnInit {
  public profileImage = PROFILE_IMG;
  constructor() {}

  ngOnInit() {}
}
