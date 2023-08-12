import { Component, OnInit } from '@angular/core';
import { ModalConfig, ModalConfirmationComponent, ModalRef, ModalService } from '@design-system/core';
import {
  CreateMeetingDTO, EditMeetingDTO, ManagerMeetingService,
  MeetingDetailDTO, MeetingSearchUserDTO,
  MeetingUserDTO,
  MessageService,
  SelectionItem,
  SelectionType
} from '@flex-team/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'fxt-modal-meeting-detail',
  templateUrl: './modal-meeting-detail.component.html',
  styleUrls: ['./modal-meeting-detail.component.scss']
})
export class ModalMeetingDetailComponent implements OnInit {

  meeting: MeetingDetailDTO = new MeetingDetailDTO();
  users: MeetingSearchUserDTO[] = [];
  canEdit = false;
  hasChanges = false;
  periodTime = { date: '', start: '', end: '', rawDate: '' };
  timePicks: String[] = [];
  teams: SelectionItem[] = [];

  SelectionTypeEnum = SelectionType;

  constructor(private managerMeetingService: ManagerMeetingService,
    private config: ModalConfig, private modalRef: ModalRef,
    private messageService: MessageService,
    private modalService: ModalService
  ) {
    this.meeting = this.config.data.meeting;
    this.periodTime = this.getPeriodTime(this.meeting);
    this.canEdit = this.config.data.canEdit;
    this.getTimePicks();
  }

  ngOnInit() {
    if (this.meeting.id) {
      this.getMeetingDetail(this.meeting.id);
    }

    if (this.canEdit) {
      this.getAllUsersInCompany(this.meeting.startDate);
    }
  }

  onSelectionChanged(items: SelectionItem[]) {
    const teams = items.filter(x => x.type === SelectionType.Team);
    const users = items.filter(x => x.type === SelectionType.User && x.id != this.meeting.organizerId);
    users.forEach(user => {
      if (user.isExternalEmail) {
        const isExistedUser = this.meeting.users.find(u => u.fullName == user.name) != null;
        if (isExistedUser) {
          return;
        }
      }

      const found = this.meeting.users.find(x => x.id == user.id && !x.isExternalEmail);
      if (!found) {
        const foundUser = this.users.find(x => x.id == user.id);
        this.meeting.users.push(<MeetingUserDTO>{
          id: user.id,
          fullName: user.name,
          image: user.image,
          selectedRemoteLocation: foundUser?.selectedRemoteLocation,
          color: foundUser?.color,
          orderInList: foundUser?.orderInList,
          hierarchyLevel: foundUser?.hierarchyLevel,
          isExternalEmail: user.isExternalEmail
        });
        this.hasChanges = true;
      }
    })

    teams.forEach(team => {
      const found = this.teams.find(x => x.id == team.id);
      if (!found) {
        this.teams.push(team);
        this.hasChanges = true;
      }
    })
  }

  getMeetingDetail(meetingId: string) {
    this.managerMeetingService.getMeetingDetail(meetingId).subscribe((resp) => {
      this.meeting = resp.workload;
    })
  }

  getAllUsersInCompany(date: Date) {
    this.managerMeetingService.getAllUsersInCompany(DateTime.fromJSDate(date)).subscribe((resp) => {
      let userArr = resp.workload.filter(x => x.id != this.meeting.organizerId);
      this.updateUserForSearch(userArr);
    })
  }

  updateUserForSearch(userArr: MeetingSearchUserDTO[]) {
    this.users = userArr.map(x => {
      x.nameEmail = x.name + " " + x.email;
      return x;
    });
  }

  createOrEditMeeting() {
    const dto: EditMeetingDTO | CreateMeetingDTO = this.meeting.id
      ? new EditMeetingDTO(this.meeting) : new CreateMeetingDTO(this.meeting);

    dto.teamIds = this.teams.map(x => x.id);

    const action$ = this.meeting.id ?
      this.managerMeetingService.editMeeting(dto as EditMeetingDTO) :
      this.managerMeetingService.createMeeting(dto as CreateMeetingDTO);

    action$.subscribe((resp) => {
      if (resp.workload) {
        this.messageService.success();
        this.modalRef.close(resp.workload);
      } else {
        this.messageService.error(resp.errorMessage);
      }
    })
  }

  onBtnDeleteClicked() {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto',
      disableClose: true,
    });

    modalRef.afterClosed$.subscribe(ok => {
      if (ok) {
        this.deleteMeeting()
      }
    })
  }

  onCrossClick(id: string, type: SelectionType) {
    if (type === SelectionType.User) {
      this.meeting.users = this.meeting.users.filter(x => x.id !== id);
    }

    if (type === SelectionType.Team) {
      this.teams = this.teams.filter(x => x.id !== id);
    }

    this.hasChanges = true;
  }

  onTimeChange(value: any, isStart?: boolean) {
    const newTime = new Date(`${this.periodTime.rawDate} ${value}`);
    isStart ? this.meeting.startDate = newTime : this.meeting.endDate = newTime;
    this.hasChanges = true;
  }

  private deleteMeeting() {
    this.managerMeetingService.deleteMeeting(this.meeting.id).subscribe(resp => {
      if (resp.workload) {
        this.messageService.success();
        this.modalRef.close(resp.workload);
      } else {
        this.messageService.error(resp.errorMessage);
      }
    })
  }

  private getPeriodTime(meeting: MeetingDetailDTO) {
    const start = DateTime.fromJSDate(meeting.startDate).toFormat('HH:mm');
    const end = DateTime.fromJSDate(meeting.endDate).toFormat('HH:mm');
    const date = DateTime.fromJSDate(meeting.startDate).toFormat('EEE dd MMM');
    const rawDate = DateTime.fromJSDate(meeting.startDate).toFormat('yyyy MM dd');
    return { date, start, end, rawDate };
  }

  private getTimePicks() {
    for (let i = 6; i <= 21; i++) {
      for (let j = 0; j < 2; j++) {
        this.timePicks.push(i + ":" + (j === 0 ? "00" : 30 * j));
      }
    }
  }

}
