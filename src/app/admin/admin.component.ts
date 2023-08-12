import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService, User } from '@flex-team/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {

  public currentUser: User;

  private _destroyed = new Subject<void>();

  constructor(private authService: AuthenticationService) {
  }

  ngOnInit() {
    this.authService.currentUser$.pipe(takeUntil(this._destroyed)).subscribe(data => {
      this.currentUser = data;
    })
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }


}
