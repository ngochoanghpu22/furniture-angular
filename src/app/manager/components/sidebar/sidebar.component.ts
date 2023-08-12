import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService, ConfigurationType, ManagerMapViewService, User, UserRole } from '@flex-team/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TaskService } from 'src/app/core/services/task-service/task.service';
import { UserService } from 'src/app/core/services/user-service/user.service';
import { Role } from 'src/app/core/services/workloads/enums/role.enum';

@Component({
  selector: 'fxt-manager-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagerSidebarComponent implements OnInit, OnDestroy {

  public currentUser: any;

  public displayMap: boolean = false;
  public IsAdmin: boolean = false;
  public IsBeta: boolean = false;
  public IsManager: boolean = false;
  public IsRH: boolean = false;
  public IsOfficeManager: boolean = false;
  public IsStatManager: boolean = false;
  public IsTeamManager: boolean = false;
  public IsOrganizationManager: boolean = false;

  public showMenu = false;

  private _destroyed: Subject<void> = new Subject<void>();

  loading = false;

  isShowUsers = false;
  isShowUserMenu = false;
  isShowTaskMenu = false;
  isShowAddTask = false;

  @Input() showContent: boolean = false;
  @Input() title: string = '';
  @Input() icon: string = '';

  constructor(
    public authService: AuthenticationService,
    public userService: UserService,
    public taskService: TaskService,
    private router: Router,
    private managerMapViewService: ManagerMapViewService,
    private cd: ChangeDetectorRef) {
    this.IsAdmin = authService.currentUserHasRole(UserRole.Admin);
    this.IsBeta = authService.currentUserHasRole(UserRole.Beta);
    this.IsManager = authService.currentUserHasRole(UserRole.FullManager);
    this.IsRH = authService.currentUserHasRole(UserRole.HRManager);
    this.IsOfficeManager = authService.currentUserHasRole(UserRole.OfficeManager);
    this.IsStatManager = authService.currentUserHasRole(UserRole.StatManager);
    this.IsTeamManager = authService.currentUserHasRole(UserRole.TeamManager);
    this.IsOrganizationManager = authService.currentUserHasRole(UserRole.OrganizationManager);
    this.displayMap = authService.isMapCapabilitiesEnabled;
  }

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    this.isShowUsers = this.currentUser.role == Role.Admin || this.currentUser.role == Role.SuperAdmin;
    this.isShowAddTask = this.currentUser.role == Role.Admin || this.currentUser.role == Role.SuperAdmin;;

    this.managerMapViewService.currentUser$.pipe(takeUntil(this._destroyed)).subscribe(currentUser => {
      if (currentUser && currentUser.id == this.currentUser.id ) {
        this.currentUser = currentUser;
        this.cd.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  goToDashboard() {
    this.router.navigate(['Dashboard']);
  }

  onAvatarClicked($event: any) {
    this.showMenu = true;
    $event.preventDefault();
    $event.stopPropagation();
  }

  showSubenuUser() {
    this.isShowUserMenu = !this.isShowUserMenu;
    this.isShowTaskMenu = false;
  }

  showSubenuTask() {
    this.isShowTaskMenu = !this.isShowTaskMenu;
    this.isShowUserMenu = false;
  }

}
