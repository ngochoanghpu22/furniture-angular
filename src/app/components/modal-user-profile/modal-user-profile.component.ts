import {
  AfterViewInit, ChangeDetectorRef, Component, ElementRef,
  NgZone, OnDestroy, OnInit, ViewChild
} from '@angular/core';
import { ModalConfig, ModalRef, ModalService, ModalUploadPictureComponent } from '@design-system/core';
import {
  AuthenticationService, ManagerMapViewService, ManagerSettingService, MessageService,
  ModalUserProfileTab,
  ProfileService, SelectionType, Team, User, UserRole
} from '@flex-team/core';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import { PopoverDirective } from 'ngx-bootstrap/popover';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from 'src/app/core/services/user-service/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fxt-modal-user-profile',
  templateUrl: './modal-user-profile.component.html',
  styleUrls: ['./modal-user-profile.component.scss']
})
export class ModalUserProfileComponent implements OnInit, AfterViewInit, OnDestroy {

  profileForm: FormGroup;

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

  loading = false;

  fileToUpload: File = null;

  constructor(
    private config: ModalConfig,
    private modalRef: ModalRef,
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
    this.user = this.config.data.user;
    this.hideScheduler = this.config.data.hideScheduler;

    this.genders = [
      {id: "Male", name: "Male"},
      {id: "FeMale", name: "FeMale"},
    ]
    

    this.profileForm = this.formBuilder.group({
      id: ['', [Validators.required]],
      //email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      genderId: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      address: ['', []],
    });
  }

  ngOnInit(): void {
    this.initProfileForm();
  }

  initProfileForm() {
    const currentUser = this.authService.currentUser;
    this.profileForm.controls.id.setValue(currentUser.id);
    //this.profileForm.controls.email.setValue(currentUser.email);
    this.profileForm.controls.name.setValue(currentUser.name);
    this.profileForm.controls.genderId.setValue(currentUser.gender);
    this.profileForm.controls.phone.setValue(currentUser.phone);
    this.profileForm.controls.address.setValue(currentUser.address);
  }

  updateProfile() {
    this.loading = true;

    let userDto: any = {};
    userDto.id = this.profileForm.controls.id.value;
    //userDto.email = this.profileForm.controls.email.value;
    userDto.name = this.profileForm.controls.name.value;
    userDto.gender = this.profileForm.controls.genderId.value;
    userDto.phone = this.profileForm.controls.phone.value;
    userDto.address = this.profileForm.controls.address.value;

    this.userService
      .updateProfile(userDto)
      .subscribe(
        (data: { resultObj: any; }) => {
          this.loading = false;
          this.authService.currentUser = data.resultObj;
          this.managerMapViewService.currentUser = data.resultObj;
          this.modalRef.close();
          this.toastr.success("Updated profile successfully.");
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
    return this.profileForm.controls;
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
      .updateAvatar(this.fileToUpload, this.authService.currentUser.id)
      .subscribe(
        (data) => {
          this.loading = false;
          this.user.avatar = data.message;
          this.authService.currentUser = this.user;
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

}
