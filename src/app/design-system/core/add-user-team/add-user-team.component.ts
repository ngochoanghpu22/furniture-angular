import {
  ChangeDetectorRef, Component, ElementRef, EventEmitter,
  Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild
} from '@angular/core';
import { Guid_Empty, ManagerSettingService, MessageService, Team, User } from '@flex-team/core';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

const RegExp_Email = new RegExp("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$");

@Component({
  selector: 'fxt-add-user-team',
  templateUrl: './add-user-team.component.html',
  styleUrls: ['./add-user-team.component.scss']
})
export class SettingAddUserTeamComponent implements OnInit, OnDestroy, OnChanges {

  @ViewChild('input', { static: true }) inputRef: ElementRef | null = null;

  @Input() team: Team;

  @Output() added: EventEmitter<User> = new EventEmitter<User>();
  @Output() selected: EventEmitter<User> = new EventEmitter<User>();

  users: User[];

  showSuggestions = false;
  loading = false;
  previousSearchTerm = '';
  isEmail = false;

  disableSaveOnSelect = false;

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private cd: ChangeDetectorRef,
    private managerSettingService: ManagerSettingService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    fromEvent(this.inputRef?.nativeElement, 'click')
      .pipe(takeUntil(this._destroyed)).subscribe(_ => {
        this.checkAndLaunchSearch();
      });

    fromEvent(this.inputRef?.nativeElement, 'keyup')
      .pipe(
        takeUntil(this._destroyed),
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(_ => {
        this.checkAndLaunchSearch();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.team && this.team) {
      this.disableSaveOnSelect = this.team.id === Guid_Empty;
      this.clear();
    }
  }


  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  trackByFn(index: number, item: any): string {
    return item.id;
  }

  onAddUserClicked(user: User) {
    if (this.disableSaveOnSelect) {
      this.selected.emit(user);
      this.clear();
    } else {
      this.addUserToTeam(user);
    }
  }

  /**
   * Call API to add user to team
   * @param user
   */
  private addUserToTeam(user: User) {
    this.managerSettingService.addUserToTeam(this.team.id, user.id).subscribe((data) => {
      this.checkAndLaunchSearch();
      this.added.emit(user);
      this.messageService.success('notifications.use_has_been_added');
      this.inputRef.nativeElement.value = "";
    }, _ => {
      this.messageService.error();
    })
  }

  clear() {
    if (this.inputRef && this.showSuggestions) {
      this.inputRef.nativeElement.value = "";
      this.showSuggestions = false;
    }
  }

  onInviteByMailClicked() {
    const inputValue = this.inputRef?.nativeElement.value;
    const invitedUser = new User();
    invitedUser.email = inputValue.toLowerCase();
    invitedUser.firstName = '';
    invitedUser.lastName = '';

    if (this.disableSaveOnSelect) {
      this.selected.emit(invitedUser);
    } else {
      this.inviteByEmail(invitedUser);
    }

    this.clear();

  }

  /**
   * Call API: Invite user by email
   * @param invitedUser 
   */
  inviteByEmail(invitedUser: User) {
    this.managerSettingService.inviteUser(this.team.id, invitedUser).subscribe(data => {
      this.added.emit(data.workload);
      this.clear();
      this.messageService.success('onboarding.invitation_email_sent');
    }, _ => {
      this.messageService.error();
    })
  }

  private checkAndLaunchSearch() {
    const value = this.inputRef?.nativeElement.value;
    this.showSuggestions = !!value;
    if (value !== this.previousSearchTerm) {
      this.launchSearch(value.trim());
      this.previousSearchTerm = value;
    }
    this.cd.detectChanges();
  }

  private launchSearch(searchTerm: string) {
    this.loading = true;
    this.isEmail = RegExp_Email.test(searchTerm.toLowerCase());
    if (!searchTerm) {
      this.users = null;
      return;
    }
    this.managerSettingService.search(this.team.id, searchTerm).subscribe(data => {
      this.updateData(data.workload);
    }, _ => {
      this.updateData();
    })
  }

  private updateData(data?: User[]) {
    this.users = data || [];
    this.loading = false;
    this.cd.detectChanges();
  }

}
