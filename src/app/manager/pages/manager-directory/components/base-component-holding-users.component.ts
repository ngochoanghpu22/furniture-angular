import { ChangeDetectorRef } from '@angular/core';
import {
  ModalAddEditComponent, ModalConfirmationComponent,
  ModalInformationComponent,
  ModalService, ModalUploadUserExcelComponent
} from '@design-system/core';
import {
  AddEditWorkingPolicyDTO, AuthenticationService, AuthProvider, DirectoryCreateUserDTO,
  DirectoryCurrentUserDTO, DirectoryPendingUserDTO, FileService,
  ImportExcelErrorType,
  ManagerDirectoryService, ManagerOrganizationService, MessageService,
  Page, SelectionItem, Team, UserRole, Workload
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ColumnMode, SelectionType, TableColumn } from '@swimlane/ngx-datatable';
import { Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';

type WorkingPolicyOption = { value: string, label: string };
type CoreTeams = { value: string, label: string };

type DirectoryUserDTO = DirectoryCurrentUserDTO | DirectoryPendingUserDTO;

export abstract class BaseComponentHoldingUsersComponent {

  page = new Page();
  rows = new Array<DirectoryUserDTO>();
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  columns: TableColumn[];
  loading = false;

  public workingPolicies: WorkingPolicyOption[] = [];
  public coreTeams: CoreTeams[] = [];
  canEdit = false;
  oldSortProp: string;
  oldSortOrder: string;

  errorMessage = '';
  successMessage = '';
  message = "";
  maxCount = 5;

  formatDateTime: string;

  selection: SelectionItem[] = [];
  authProvider: AuthProvider;

  protected _destroyed = new Subject<void>();

  constructor(
    protected authService: AuthenticationService,
    protected modalService: ModalService,
    protected messageService: MessageService,
    protected managerOrganizationService: ManagerOrganizationService,
    protected managerDirectoryService: ManagerDirectoryService,
    protected fileService: FileService,
    protected translocoService: TranslocoService,
    protected cd: ChangeDetectorRef
  ) {
    this.canEdit = this.authService.currentUserHasOneRole([
      UserRole.Admin,
      UserRole.FullManager,
      UserRole.HRManager,
      UserRole.OrganizationManager
    ]);

    this.formatDateTime = this.authService.formatDateTime;
    this.authProvider = this.authService.currentUser.authProvider;

  }

  loadData() {
    this.getWorkingPolicies();
    this.getHierarchyTeamsOfCompany();
  }

  edit(row: DirectoryUserDTO) {
    this.addOrEditUser(row);
  }

  addOrEditUser(row?: DirectoryUserDTO) {
    if (!this.canEdit) return;
    const { model, fields } = this.factoryModelAndFields(row);

    const modalRef = this.modalService.open(ModalAddEditComponent, {
      width: 'auto',
      disableClose: true,
      data: {
        model: model,
        fields: fields,
      },
    });

    modalRef.afterClosed$.subscribe((resp) => {
      if (resp && resp.model) {
        const model = resp.model;

        if (model.id && model.email !== model.oldEmail) {
          const confirmationModalRef = this.modalService.open(ModalConfirmationComponent, {
            width: '400px',
            disableClose: true,
            data: {
              message: this.translocoService.translate('organization.email_change_confirmation_message')
            }
          });

          confirmationModalRef.afterClosed$.subscribe(ok => {
            if (ok) {
              this.saveUserData(model);
            } else {
              this.setPage({ offset: this.page.pageNumber });
            }
          })

        }
        else {
          this.saveUserData(model);
        }
      }
    });
  }

  saveUserData(userData: any) {
    if (userData.roles) {
      userData.roles = Object.keys(userData.roles).filter(x => !!userData.roles[x]);
    }

    this.managerDirectoryService.createOrEditUser(userData)
      .subscribe((data: any) => {
        if (data.errorCode == "USER_WITH_SAME_EMAIL_ALREADY_EXISTS") {
          this.messageService.error('organization.use_cant_change_email')
        } else {
          this._notify(data);
          this.setPage({ offset: this.page.pageNumber });
          this.updateCurrentUserIfNeeded(userData);
        }
      });
  }

  onSort($event: any) {
    this.oldSortProp = $event.sorts[0]?.prop;
    this.oldSortOrder = $event.sorts[0]?.dir;
    this.setPage({
      offset: 0,
      sortProp: this.oldSortProp,
      sortOrder: this.oldSortOrder
    })
  }

  importMicrosoftDirectory() {
    this.loading = true;
    this.managerOrganizationService.importMicrosoftDirectory()
      .pipe(finalize(() => this.loading = false))
      .subscribe((resp) => {
        if (resp.workload) {
          this.messageService.success('organization.import_number_person_per_total', {
            nbUserAdded: resp.workload.userAdded,
            nbUserTotal: resp.workload.userTotal
          });
        } else {
          this.messageService.error();
        }

      }, (error) => {
        this.messageService.error(error);
      });
  }

  private updateCurrentUserIfNeeded(model: any) {
    if (model.id == this.authService.currentUser.id) {
      const currentUser = this.authService.currentUser;
      currentUser.firstName = model.firstName;
      currentUser.lastName = model.lastName;
      currentUser.workingPolicyId = model.workingPolicyId;

      this.authService.currentUser = { ...currentUser };
    }
  }

  private factoryModelAndFields(row?: DirectoryUserDTO) {

    const isEdit = row != null;

    const model = row == null ? <DirectoryCreateUserDTO>{} : <DirectoryCreateUserDTO>{
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      workingPolicyId: row.workingPolicyId,
      coreTeamId: row.coreTeamId,
      oldEmail: row.email,
    };

    let obj: any = { [UserRole.User]: true };
    if (row?.roleSerialized != null) {
      obj = {};
      row.roleSerialized.split(',').forEach(role => {
        const existRole = UserRole[role.trim() as keyof typeof UserRole]
        if (existRole) {
          obj[role.trim()] = true;
        }
      });
    }
    model.roles = obj;

    let formlyFieldsUser: FormlyFieldConfig[] = [
      {
        key: 'firstName',
        type: 'input',
        templateOptions: {
          label: this.translocoService.translate('main.first_name'),
          required: true,
        },
      },
      {
        key: 'lastName',
        type: 'input',
        templateOptions: {
          label: this.translocoService.translate('main.last_name'),
          required: true,
        },
      },
      {
        key: 'email',
        type: 'input',
        templateOptions: {
          label: this.translocoService.translate('main.email'),
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$',
          required: true
        },
      },
      {
        key: 'roles',
        wrappers: ['custom-multicheckbox-with-tooltip-wrapper'],
        templateOptions: { label: this.translocoService.translate('main.roles') + ' *', required: true, disabled: false },
        validators: {
          validation: [
            { name: 'roleFieldGroupRequired', options: { errorPath: 'roles' } },
          ],
        },
        fieldGroup: [
          {
            key: UserRole.User,
            type: 'checkbox',
            defaultValue: !!obj[UserRole.User],
            wrappers: ['checkbox-tooltip-wrapper'],
            templateOptions: <any>{
              tooltip: this.translocoService.translate('directory.user_tooltip'),
              label: this.translocoService.translate('directory.user')
            },
          },
          {
            key: UserRole.HRManager,
            type: 'checkbox',
            defaultValue: false,
            wrappers: ['checkbox-tooltip-wrapper'],
            templateOptions: <any>{
              tooltip: this.translocoService.translate('directory.rh_manager_tooltip'),
              label: this.translocoService.translate('directory.rh_manager')
            },
          },
          {
            key: UserRole.OfficeManager,
            type: 'checkbox',
            defaultValue: false,
            wrappers: ['checkbox-tooltip-wrapper'],
            templateOptions: <any>{
              tooltip: this.translocoService.translate('directory.office_manager_tooltip'),
              label: this.translocoService.translate('directory.office_manager')
            },
          },
          {
            key: UserRole.TeamManager,
            type: 'checkbox',
            defaultValue: false,
            wrappers: ['checkbox-tooltip-wrapper'],
            templateOptions: <any>{
              tooltip: this.translocoService.translate('directory.team_manager_tooltip'),
              label: this.translocoService.translate('directory.team_manager')
            },
          },
          {
            key: UserRole.StatManager,
            type: 'checkbox',
            defaultValue: false,
            wrappers: ['checkbox-tooltip-wrapper'],
            templateOptions: <any>{
              tooltip: this.translocoService.translate('directory.stat_manager_tooltip'),
              label: this.translocoService.translate('directory.stat_manager')
            },
          },
          {
            key: UserRole.OrganizationManager,
            type: 'checkbox',
            defaultValue: false,
            wrappers: ['checkbox-tooltip-wrapper'],
            templateOptions: <any>{
              tooltip: this.translocoService.translate('directory.organization_manager_tooltip'),
              label: this.translocoService.translate('directory.organization_manager')
            },
          },
        ],
      },
      {
        key: 'coreTeamId',
        type: 'select',
        templateOptions: {
          label: this.translocoService.translate('main.add_to_team'),
          options: [
            {
              value: null, label: this.translocoService.translate('user_profile.no_team_selected')
            },
            ...this.coreTeams
          ],
          required: false,
          disabled: false
        },
      },
      {
        key: 'workingPolicyId',
        type: 'select',
        templateOptions: {
          label: this.translocoService.translate('organization.working_policy'),
          options: [{
            value: null, label: this.translocoService.translate('user_profile.no_working_policy_selected')
          }, ...this.workingPolicies],
          required: false,
          disabled: false
        }
      }
    ];

    if (!isEdit) {
      formlyFieldsUser.push({
        key: "isInvitedByEmail",
        type: 'checkbox',
        defaultValue: false,
        wrappers: ['checkbox-tooltip-wrapper'],
        templateOptions: <any>{
          tooltip: this.translocoService.translate('directory.invitation_email_tooltip'),
          label: this.translocoService.translate('directory.invitation_email')
        },
      });
    }

    const fields = formlyFieldsUser;

    return { model, fields };
  }

  importMultipleUser() {
    this.getExcelImportTemplate();
    this.openExcelImportModal();
  }

  openExcelImportModal() {
    this.modalService.open(ModalUploadUserExcelComponent, {
      width: '450px',
      data: { fn: this.uploadUserExcelFile, context: this },
    });
  }

  generateTitle() {
    this.message = `<b>Error Message</b><hr class="errorMessage">` + this.message;
  }

  generateErrorMessage(errors: any, importExcelErrorType: number) {
    let errorMessageLines = errors.filter((x: { type: ImportExcelErrorType; line: number; message: string; }) => x.type == importExcelErrorType);

    let currentCount = 1;
    for (let errorMessageLine of errorMessageLines) {
      if (currentCount < this.maxCount) {
        if (currentCount == 1) {
          this.message = this.message + (errorMessageLine.line + 1);
        } else {
          this.message = this.message + ", " + (errorMessageLine.line + 1);
        }
      } else {
        this.message = this.message + "...";
      }
      currentCount++;
    }
    this.message = this.message + "<hr class='errorMessage'>";
  }

  private uploadUserExcelFile(file: FileList, isInvitedByEmail: boolean) {
    this.managerDirectoryService.addUsersViaExcelSheet(file, this.authService.currentUser.idCompany, isInvitedByEmail).subscribe(r => {

      if (r.workload.errors.length > 0) {
        if (r.workload.errors.filter((x: { type: ImportExcelErrorType; }) => x.type == ImportExcelErrorType.NoDataAvailable).length > 0) {
          this.message = this.translocoService.translate('organization.no_data_available');
        } else {
          this.message = '';
          if (r.workload.errors.filter((x: { type: ImportExcelErrorType; }) => x.type == ImportExcelErrorType.UserDuplicated).length > 0) {
            this.message = this.message + this.translocoService.translate('organization.duplicate_people') + " ";
            this.generateErrorMessage(r.workload.errors, ImportExcelErrorType.UserDuplicated);
          }
          if (r.workload.errors.filter((x: { type: ImportExcelErrorType; }) => x.type == ImportExcelErrorType.ManagerNotFound).length > 0) {
            this.message = this.message + this.translocoService.translate('organization.manager_does_not_exist') + " ";
            this.generateErrorMessage(r.workload.errors, ImportExcelErrorType.ManagerNotFound);
          }
          if (r.workload.errors.filter((x: { type: ImportExcelErrorType; }) => x.type == ImportExcelErrorType.UserAlreadyExists).length > 0) {
            this.message = this.message + this.translocoService.translate('organization.users_already_exists') + " ";
            this.generateErrorMessage(r.workload.errors, ImportExcelErrorType.UserAlreadyExists);
          }
          if (r.workload.errors.filter((x: { type: ImportExcelErrorType; }) => x.type == ImportExcelErrorType.UserIsOwnManager).length > 0) {
            this.message = this.message + this.translocoService.translate('organization.user_as_manager') + " ";
            this.generateErrorMessage(r.workload.errors, ImportExcelErrorType.UserIsOwnManager);
          }
          if (r.workload.errors.filter((x: { type: ImportExcelErrorType; }) => x.type == ImportExcelErrorType.ManagerNotReallyManager).length > 0) {
            this.message = this.message + this.translocoService.translate('organization.manager_doesnt_have_team') + " ";
            this.generateErrorMessage(r.workload.errors, ImportExcelErrorType.ManagerNotReallyManager);
          }
        }

        this.generateTitle();

        this.modalService.open(ModalInformationComponent, {
          width: 'auto',
          disableClose: true,
          data: {
            message: this.message,
            actionLinkToShow: true,
            actionLinkFunction: this.openExcelImportModal,
            actionLinkMessage: this.translocoService.translate('organization.retry_import'),
            parentContext: this
          },
        });
      } else {
        if (r.workload.nbLineImported > 0) {
          this.message = '';
          this.message = r.workload.nbLineImported + " " + this.translocoService.translate('organization.users_imported_success') + " <br/>";
          for (let domain of r.workload.domains) {
            this.message = this.message + " " + domain + "<br/>";
          }
          if (r.workload.nbTeamAdded == 0) {
            this.message = this.message + "No teams created.<br/>";
          }
          else {
            this.message = this.message + r.workload.nbTeamAdded + " teams created.<br/>";
            for (let team of r.workload.teamAdded) {
              this.message = this.message + " " + team + "<br/>";
            }
          }
        }
        this.modalService.open(ModalInformationComponent, {
          width: 'auto',
          disableClose: true,
          data: {
            message: this.message,
            messageClass: 'successmessage'
          },
        });
      }
    });
  }

  private getExcelImportTemplate() {
    window.open("assets/files/Users.xlsx");
  }

  getExcelUsers() {
    if (!this.canEdit) return;
    this.managerDirectoryService.getExcelUsers(this.authService.currentUser.idCompany)
      .subscribe(s => {
        this.fileService.downloadFile(s, "ListUsersInCompany.xlsx");
      });
  }

  private _notify(data: any) {
    if (!data.statusCode || data.statusCode == 200) {
      this.messageService.success('notifications.your_changes_updated')
    } else {
      this.messageService.error('notifications.an_error_occurred')
    }
  }

  private getWorkingPolicies() {
    this.managerOrganizationService.getWorkingPolicies()
      .subscribe((resp: Workload<AddEditWorkingPolicyDTO[]>) => {
        this.workingPolicies = resp.workload.map((item) => ({
          label: item.name,
          value: item.id,
        }));
      })
  }

  private getHierarchyTeamsOfCompany() {
    this.managerDirectoryService.getHierarchyTeamsOfCompany(this.authService.currentUser.idCompany)
      .subscribe((resp: Workload<Team[]>) => {
        this.coreTeams = resp.workload.map(item => ({
          label: item.name,
          value: item.id,
        }));
      })
  }

  protected abstract setPage(pageInfo: any): void;

}
