import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ModalInformationComponent, ModalService } from '@design-system/core';
import { AdminTypes } from '@flex-team/core';
import { LogCriticityPipe } from '../../pipes';
import { factoryProviders } from './factory-providers';

@Component({
  selector: 'fxt-admin-table-joblogs',
  template: `<fxt-datatable
      [columns]="columns"
      [type]="type"
      [pathGet]="pathGet"
      [canEdit]="false"
    ></fxt-datatable>

    <ng-template #commentTmp let-row="row" let-value="value">
      <span class="c-pointer" (click)="showComment($event, value)">{{
        value
      }}</span>
    </ng-template> `,
  providers: factoryProviders(AdminTypes.JobLogs),
})
export class AdminTableJobLogsComponent implements OnInit {
  @ViewChild('commentTmp', { static: true })
  commentTmp: TemplateRef<any> | null = null;

  type = AdminTypes.JobLogs;

  columns: any[] = [];

  pathGet = 'GetJobLogs';

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.columns = [
      { name: 'Part', prop: 'part' },
      { name: 'SubPart', prop: 'subPart' },
      { name: 'Criticity', prop: 'criticity', pipe: new LogCriticityPipe() },
      { name: 'Comment', prop: 'comment', cellTemplate: this.commentTmp, disableSort: true },
      { name: 'Date', prop: 'date' },
    ];
  }

  showComment(event: any, comment: string) {
    event.preventDefault();
    if (!comment) {
      return;
    }
    this.modalService.open(ModalInformationComponent, {
      width: 'auto',
      disableClose: true,
      data: {
        message: comment,
      },
    });
  }
}
