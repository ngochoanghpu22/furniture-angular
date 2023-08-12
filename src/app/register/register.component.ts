
import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef,
  NgZone, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { FxtAnimations, ModalConfig, ModalRef, ModalService, ModalUploadPictureComponent } from '@design-system/core';
import {
  AuthenticationService, ManagerMapViewService, ManagerSettingService, MessageService,
  ModalUserProfileTab,
  ProfileService, SelectionType, Team, User, UserRole
} from '@flex-team/core';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/services/user-service/user.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Role } from 'src/app/core/services/workloads/enums/role.enum';
import { REGEX_PATTERN } from 'src/app/core/regex/regex';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  animations: [FxtAnimations.slideLeftRight]
})
export class RegisterComponent implements OnInit {

  createForm: FormGroup;

  @ViewChild('pop') popoverRef: PopoverDirective;
  @ViewChild('dropdown') dropdown: BsDropdownDirective;

  public activeTab = ModalUserProfileTab.Schedule;

  public user: User;

  public isCurrentUser: boolean = false;
  public favoriteTeamOfCurrentUser: Team;
  isInFavoriteTeam = false;

  public coreTeams: Team[] = [];
  public groupTeams: Team[] = [];
  public coreTeamsText: string;

  teamInfos: { name: string, id: string, userAlreadyIn: boolean }[] = [];
  canEdit = false;
  hideScheduler = false;
  ModalUserProfileTabEnum = ModalUserProfileTab;

  private _onHostClick: any;
  private _btnToggleMenuRef: HTMLElement;

  private _destroyed = new Subject<void>();

  genders: any[];

  roles: any[];

  levels: any[];

  loading = false;

  fileToUpload: File = null;

  isEditUser = false;

  canEditUser = false;

  userId: any = null;

  currentUser: any = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private managerSettingService: ManagerSettingService,
    private modalService: ModalService,
    private authService: AuthenticationService,
    private userService: UserService,
    private messageService: MessageService,
    private profileService: ProfileService,
    private managerMapViewService: ManagerMapViewService,
    private toastr: ToastrService,
    private ele: ElementRef,
    private cd: ChangeDetectorRef,
    private zone: NgZone
  ) {

    const url = this.router.url;
    this.isEditUser = url.indexOf("edit-user") != -1;

    this.currentUser = null;
    this.canEditUser = false;

    this.initForm();

    if (this.canEditUser && this.isEditUser) {
      this.userId = parseInt(this.activatedRoute.snapshot.params.id);
      if (this.userId) {
        this.getUserById(this.userId);
      }
    }

    this.genders = [
      {id: "Male", name: "Male"},
      {id: "FeMale", name: "FeMale"},
    ]

    this.roles = [
      {id: "User", name: "User"},
      {id: "Client", name: "Client"}
    ]

    this.levels = [
      {id: 1, name: "1"},
      {id: 2, name: "2"},
    ]
    
  }

  ngOnInit(): void {
    //this.initcreateForm();
  }

  initForm(currentUser: any = null) {
    this.createForm = this.formBuilder.group({
      //email: [ currentUser ? currentUser.email : '', [Validators.required, Validators.email]],
      username: [ currentUser ? currentUser.userName : '', [Validators.required]],
      password: [{ value: '', disabled : currentUser != null }, [Validators.required]],
      confirmPassword: [{ value: '', disabled : currentUser != null }, [Validators.required]],
      name: [ currentUser ? currentUser.name : '', [Validators.required]],
      genderId: [ currentUser ? currentUser.gender : null, [Validators.required]],
      roleId: [ currentUser ? currentUser.role : null, [Validators.required]],
      //levelId: [ currentUser ? currentUser.levelId : null, [Validators.required]],
      phone: [ currentUser ? currentUser.phone : '', [Validators.required, Validators.pattern(REGEX_PATTERN.PHONE)]],
      address: [ currentUser ? currentUser.address : '', []],
    });

    //this.createForm.get('password').setValidators([Validators.required, matchValidator(this.createForm.get('password'), this.createForm.get('confirmPassword'))]);    
    this.createForm.get('confirmPassword').setValidators([Validators.required, matchValidator(this.createForm.get('password'), this.createForm.get('confirmPassword'))]);
  }

  getUserById(id: any) {
    var params = {
        id: id
    };

    this.userService
    .getUserById(params)
    .subscribe(
      (data: any) => {
        var respose = data.body.resultObj;
        this.initForm(respose);
      },
      (error: { message: string; }) => {
        this.loading = false;
        this.toastr.error(error.message);
      }
    );
  }

  gotoLogin() {
    this.router.navigate(['/login']);
  }

  createUser() {
    console.log(this.createForm.valid);
    this.loading = true;

    let userDto: any = {};
    userDto.id = this.userId;
    userDto.username = this.createForm.controls.username.value;
    //userDto.email = this.createForm.controls.email.value;
    userDto.password = this.createForm.controls.password.value;
    userDto.name = this.createForm.controls.name.value;
    userDto.balance = 0;
    userDto.gender = this.createForm.controls.genderId.value;
    userDto.role = this.createForm.controls.roleId.value;
    userDto.level = 1;
    userDto.phone = this.createForm.controls.phone.value;
    userDto.address = this.createForm.controls.address.value;

    this.userService
      .createUser(userDto)
      .subscribe(
        (data: any) => {
          this.loading = false;
          if (data.isSuccessed) {
            if (!this.isEditUser) {
              this.toastr.success("Create user successfully.");
            }
            else {
              this.authService.currentUser = data.resultObj;
              this.toastr.success("Update user successfully.");
            }
            
            this.router.navigate(['/login']);
          }
          else {
            this.toastr.error(data.message);
          }
        },
        (error: { message: string; }) => {
          this.loading = false;
          this.toastr.error(error.message);
        }
      );
  }

  ngAfterViewInit() {
    this._btnToggleMenuRef = this.ele.nativeElement.querySelector('.btn-toggle-menu') as HTMLElement;

    if (this.popoverRef) {
      this.popoverRef.onShown.pipe(takeUntil(this._destroyed)).subscribe(() => {
        this.addEventsDocument();
      })

      this.popoverRef.onHidden.pipe(takeUntil(this._destroyed)).subscribe(() => {
        this.removeEventsDocument();
      })
    }
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
    this.removeEventsDocument();
  }

  get f() {
    return this.createForm.controls;
  }

  onPolicyChanged(policyId: string) {
    if (this.isCurrentUser) {
      const currentUser = this.authService.currentUser;
      this.authService.currentUser = {
        ...currentUser,
        workingPolicyId: policyId
      }
    }
  }

  openTakePicture() {
    const modalRef = this.modalService.open(ModalUploadPictureComponent, { width: 'auto' });
    modalRef.afterClosed$.subscribe(resp => {
      if (resp) {
        const now = new Date();
        this.user.tinyPicture = `${resp}?${now.getTime()}`;
        this.authService.currentUser = { ...this.user };
        this.messageService.success();
      }
    })
  }

  onClickAvatar() {
    if (this.isCurrentUser) {
      this.dropdown.isOpen = !this.dropdown.isOpen;
    }
  }

  onClickOutside() {
    this.dropdown.isOpen = false;
  }

  handleInputChange(e: any) {
    var file = e.target.files[0];
    var pattern = /image-*/;
    var reader = new FileReader();
    if (!file.type.match(pattern)) {
      alert('invalid format');
      return;
    }

    this.fileToUpload = file;
    this.handleUpLoadAvatar();
  }

  private handleUpLoadAvatar() {
    this.userService
      .updateAvatar(this.fileToUpload, this.currentUser.id)
      .subscribe(
        (data) => {
          this.loading = false;
          this.user.avatar = data.resultObj;
          this.managerMapViewService.currentUser = this.user;
          this.toastr.success("Updated avatar successfully.");
        },
        (error) => {
          this.loading = false;
          this.toastr.error(error.message);
        }
      );
  }

  getAllTeamCurrentUserOwns() {
    this.managerSettingService.getAllTeamUserOwns(this.authService.currentUser.id).subscribe(resp => {
      this.teamInfos = resp.workload
        .filter(x => !x.isPrefered)
        .map(x => {
          return {
            name: x.name,
            id: x.id,
            userAlreadyIn: x.users.findIndex((y: any) => y.idUser == this.user.id) >= 0
          }
        });
    })
  }

  addOrRemoveUser(item: any) {
    const action$ = item.userAlreadyIn
      ? this.managerSettingService.removeUserFromTeam(item.id, this.user.id)
      : this.managerSettingService.addUserToTeam(item.id, this.user.id);

    action$.subscribe(resp => {
      this.getFavoriteTeamOfCurrentUser();
      this.getAllTeamCurrentUserOwns();
      this.getSocialAndWorkingTeamsUserBelongsTo(this.user.id);
      this.messageService.success();
    })

    this.closePopover();
  }

  closePopover() {
    if (this.popoverRef) this.popoverRef.hide();
  }

  getFavoriteTeamOfCurrentUser() {
    this.managerSettingService.getFavoriteTeam(this.authService.currentUser.id).subscribe(resp => {
      this.favoriteTeamOfCurrentUser = resp.workload;
      this.isInFavoriteTeam = this.favoriteTeamOfCurrentUser?.users?.findIndex((x: any) => x.idUser == this.user.id) >= 0;
    })
  }

  toggleFavorite() {
    let action$ = null;
    if (this.isInFavoriteTeam) {
      action$ = this.managerSettingService.removeUserFromTeam(this.favoriteTeamOfCurrentUser.id, this.user.id);
    } else {
      action$ = this.managerSettingService.addUserToTeam(this.favoriteTeamOfCurrentUser.id, this.user.id);
    }

    action$.subscribe(_ => {
      this.isInFavoriteTeam = !this.isInFavoriteTeam;
      this.getSocialAndWorkingTeamsUserBelongsTo(this.user.id);
      this.messageService.success();
    });
  }

  getHierarchyTeamsThatUserOwnedOrBelongTo(userId: string) {
    this.managerSettingService.getHierarchyTeamsThatUserOwnedOrBelongTo(userId)
      .subscribe(resp => {
        this.coreTeams = resp.workload;
        this.coreTeamsText = this.coreTeams.map(x => x.name).join(', ');
        const isTeamManager = this.coreTeams.map(x => x.idOwner).indexOf(this.authService.currentUser.id) >= 0;

        const isOfficeManager = this.authService.currentUserHasRole(UserRole.OfficeManager);
        const isHRManager = this.authService.currentUserHasRole(UserRole.HRManager);
        const isAdmin = this.authService.currentUserHasRole(UserRole.Admin);
        this.canEdit = this.isCurrentUser || isOfficeManager || isHRManager || isTeamManager || isAdmin;
        this.cd.detectChanges();

      })
  }

  getSocialAndWorkingTeamsUserBelongsTo(userId: string) {
    this.groupTeams = [];
    this.managerSettingService.getSocialAndWorkingTeamsUserBelongsTo(userId).subscribe((resp) => {
      resp.workload.forEach((team: any) => {
        team.type = SelectionType.Team;
        this.groupTeams.push(team)
      });
    })
  }

  selectTab(tabIndex: ModalUserProfileTab) {
    this.activeTab = tabIndex;
    this.closePopover();
  }

  onHostClick(event: any) {
    const shouldIgnore = this._btnToggleMenuRef.contains(event.target);
    if (!shouldIgnore) {
      this.closePopover();
    }
  }

  private addEventsDocument() {
    this.zone.runOutsideAngular(() => {
      this.ele.nativeElement.addEventListener('click', this._onHostClick);
    })
  }

  private removeEventsDocument() {
    this.zone.runOutsideAngular(() => {
      this.ele.nativeElement.removeEventListener('click', this._onHostClick);
    })
  }

  onKeyUp(event: any) {
    const password = this.createForm.get('password').value;
    const confirmPassword = this.createForm.get('confirmPassword').value;

    if (password == confirmPassword) {
      this.createForm.get('confirmPassword').setErrors(null);
    }
    else {
      this.createForm.get('confirmPassword').setErrors({'match_error': true});
    }
  }

}

function matchValidator(
  control: AbstractControl,
  controlTwo: AbstractControl
): ValidatorFn {
  return () => {
    if (control.value !== controlTwo.value)
    {
      return { match_error: 'Value does not match' };
    }
         
    return null;
  };
}

