import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthenticationService, ManagerViewService, SelectionItem, UserRole } from '@flex-team/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-manager-directory',
  templateUrl: './manager-directory.component.html',
  styleUrls: ['./manager-directory.component.scss']
})

export class ManagerDirectoryComponent implements OnInit, OnDestroy {

  tags: SelectionItem[] = [];
  canEdit = false;

  private _destroyed = new Subject<void>();

  constructor(
    private managerViewService: ManagerViewService,
    private authService: AuthenticationService
  ) {
    this.canEdit = this.authService.currentUserHasOneRole([
      UserRole.Admin,
      UserRole.FullManager,
      UserRole.HRManager,
      UserRole.OrganizationManager
    ]);
  }

  ngOnInit() {
    this.managerViewService.selection$.pipe(take(1), takeUntil(this._destroyed))
      .subscribe(selection => {
        this.tags = selection;
      })
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  onSelectionChanged(selections: SelectionItem[]) {
    this.managerViewService.selection = selections;
  }

}
