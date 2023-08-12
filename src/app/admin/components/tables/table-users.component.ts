import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '@design-system/core';
import { AdminService, AdminTypes, Company, MessageService, Team, User } from '@flex-team/core';
import { AdminCompanyViewService } from '../../services';
import { AddTeamMemberComponent } from '../add-team-member/add-team-member.component';
import { FxtDatatableComponent } from '../datatable/datatable.component';
import { factoryProviders } from './factory-providers';

@Component({
  selector: 'fxt-admin-table-users',
  templateUrl: './table-users.component.html',
  providers: factoryProviders(AdminTypes.User)
})
export class AdminTableUsersComponent implements OnInit {
  teamId: string = '';
  @Input() showAdd = true;
  @ViewChild('table', { static: true }) fxtTable: FxtDatatableComponent;

  @ViewChild('inputFile', { static: true }) inputFileRef: ElementRef;

  @Input() set team(val: Team) {
    if (val) {
      this.pathGet = `GetTeamMembers/team/${val.id}`;
      this.pathCreate = `CreateUserForTeam/team/${val.id}`;
      this.pathDelete = `RemoveUserFromTeam/team/${val.id}`;
      this.teamId = val.id;
      this.cd.detectChanges();
      this.refreshTable();
    }
  }

  @Input() set company(val: Company) {
    if (val) {
      this.pathGet = `GetUsersOfCompany/company/${val.id}`;
      this.pathCreate = `CreateUserForCompany/company/${val.id}`;
      this.pathDelete = `DeleteUserFromCompany/company/${val.id}`;
      this.pathArchive = `ArchiveUserFromCompany/company/${val.id}`;
      this.pathRestore = `RestoreUser/company/${val.id}`;
      this.cd.detectChanges();
      this.refreshTable();
    }
  }

  type = AdminTypes.User;
  columns = [
    { name: 'Last name', prop: 'lastName' },
    { name: 'First name', prop: 'firstName' },
    { name: 'Email', prop: 'email' },
    { name: 'Role', prop: 'roleSerialized' },
    { name: 'Archived', prop: 'isArchived' },
  ];

  pathGet = "GetUsersOfCompany";
  pathUpdate = "updateUserOfCompany";
  pathCreate = "CreateUserForCompany";
  pathDelete = "DeleteUserFromCompany";
  pathArchive = "ArchiveUserFromCompany";
  pathRestore = "RestoreUser";

  constructor(private cd: ChangeDetectorRef,
    private adminViewService: AdminCompanyViewService,
    private adminService: AdminService,
    private router: Router,
    private modalService: ModalService,
    private messageService: MessageService
  ) {
  }

  ngOnInit() {
  }

  onImpersonate(user: User) {

    this.adminService.impersonate(user.id).subscribe((data) => {
      this.router.navigate(['/login'], { queryParams: { login: user.email } });
    });

  }

  onResendOnboardingLink(user: User) {
    this.adminService.resendOnboardingLink(user.id).subscribe((data) => {
      this.messageService.success('notifications.new_onboarding_email_sent');
    });
  }

  onAutofillMissingOnboardings(data: any) {
    this.adminService.autofillMissingOnboardings().subscribe((data) => {
      this.messageService.success('notifications.missing_onboardings_filled', {
        value: data.workload
      });
    });
  }

  handleFileSelect(evt: any) {
    const files = evt.target.files;
    const file = files[0];
    const companyId = this.adminViewService.company?.id || '';
    this.adminService.importUsersForCompany(companyId, file).subscribe((data) => {
      this.refreshTable();
      this.resetInput();
    }, () => {
      this.resetInput();
    })
  }

  addMemForTeam() {
    const companyId = this.adminViewService.company?.id || '';
    const modalRef = this.modalService.open(AddTeamMemberComponent, {
      width: '600px',
      data: {
        teamId: this.teamId,
        companyId
      },
    });
    modalRef.afterClosed$.subscribe((model) => {
      if (model === 'success') {
        this.fxtTable.setPage({ offset: 0 });
      }
    });
  }

  private refreshTable() {
    this.fxtTable.setPage({ offset: 0 });
  }

  private resetInput() {
    this.inputFileRef.nativeElement.value = '';
  }

}
