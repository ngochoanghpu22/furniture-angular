import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthProvider } from '@flex-team/core';

@Component({
  selector: 'fxt-dropdown-invite-user',
  templateUrl: './dropdown-invite-user.component.html',
  styleUrls: ['./dropdown-invite-user.component.scss']
})
export class DropdownInviteUserComponent implements OnInit {

  @Input() authProvider: AuthProvider;

  @Output() addSingleUserClicked = new EventEmitter();
  @Output() importMultipleUserClicked = new EventEmitter();
  @Output() importDirectoryClicked = new EventEmitter();

  AuthProviderEnum = AuthProvider;

  constructor() { }

  ngOnInit() {
  }

  onImportDirectoryClicked() {
    if (this.authProvider === AuthProvider.Microsoft) {
      this.importDirectoryClicked.emit();
    }
  }

}
