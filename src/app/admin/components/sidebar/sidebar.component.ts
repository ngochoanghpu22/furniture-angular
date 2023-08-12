import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { User } from '@flex-team/core';

@Component({
  selector: 'fxt-admin-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminSidebarComponent implements OnInit {

  @Input() user: User;

  constructor() {
  }

  ngOnInit() {
  }

}
