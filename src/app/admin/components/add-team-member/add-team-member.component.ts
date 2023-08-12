import { Component, OnInit } from '@angular/core';
import { ModalConfig, ModalRef } from '@design-system/core';
import { AdminService, MessageService, Page, PagedData, User } from '@flex-team/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-add-team-member',
  templateUrl: './add-team-member.component.html',
  styleUrls: ['./add-team-member.component.scss']
})
export class AddTeamMemberComponent implements OnInit {
  rows: any[] = [];
  page = new Page();
  loading = false;

  selected: User[] = []

  columns = [{ prop: 'lastName' }, { prop: 'firstName' }, { prop: 'email' }];

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  constructor(
    private config: ModalConfig,
    private adminService: AdminService,
    private modalRef: ModalRef,
    private messageService: MessageService
  ) {
    this.page.pageNumber = 1;
    this.page.pageSize = 10;
  }
  ngOnInit() {
    this.setPage({ offset: 0 });
  }

  setPage(pageInfo: { offset: number }) {
    this.page.pageNumber = pageInfo.offset;
    const url = `GetUsersForTeamToAdd/company/${this.config.data.companyId}/team/${this.config.data.teamId}`;
    this.adminService
      .getPagedData(this.page, url)
      .subscribe((pagedData: PagedData<any>) => {
        this.page = { ...pagedData.page };
        this.rows = pagedData.data as any;
      });
  }
  
  save() {
    const userIds = this.selected.map(s => s.id);
    this.loading = true;
    this.adminService.addUsersToTeam(userIds, this.config.data.teamId).subscribe(r => {
      this.messageService.success('notifications.your_changes_updated')
      this.loading = false;
      this.modalRef.close('success');
    })
  }
}
