import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FxtAnimations, ModalConfig, ModalService } from '@design-system/core';
import { AuthenticationService, AuthProvider, ManagerMeetingService, MeetingDetailDTO, MeetingListItemDTO, MeetingOrganizerDTO, MeetingRoomDTO } from '@flex-team/core';
import { DateTime } from 'luxon';
import { environment } from 'src/environments/environment';
import { ModalMeetingDetailComponent } from '../modal-meeting-detail/modal-meeting-detail.component';

@Component({
  selector: 'fxt-meeting-scheduler',
  templateUrl: './meeting-scheduler.component.html',
  styleUrls: ['./meeting-scheduler.component.scss']
})
export class MeetingSchedulerComponent implements OnInit {
  showInfo = false;

  meetings: MeetingListItemDTO[];

  selectedDate: Date;
  meetingRoom: MeetingRoomDTO;

  contextualPicture: SafeUrl;

  editable = false;

  constructor(private managerMeetingService: ManagerMeetingService,
    private modalService: ModalService,
    private modalConfig: ModalConfig,
    private domSanitizer: DomSanitizer,
    private authService: AuthenticationService) {

    this.meetingRoom = this.modalConfig.data.meetingRoom;
    this.selectedDate = this.modalConfig.data.selectedDate;

    this.contextualPicture =
      this.meetingRoom && this.meetingRoom.contextualPicture
        ? this.domSanitizer.bypassSecurityTrustUrl(environment.accessPoint + this.meetingRoom.contextualPicture)
        : null;

    const isLinkedToExternal = this.meetingRoom.googleUniqueId || this.meetingRoom.msUniqueId;
    this.editable = !(this.authService.currentUser.authProvider == AuthProvider.None
      && isLinkedToExternal);

  }

  ngOnInit(): void {
    this.getListMeetingsByOffice(this.meetingRoom.id);
  }

  getListMeetingsByOffice(officeId: string) {
    const start = DateTime.fromJSDate(this.selectedDate).set({ hour: 0, minute: 0 });
    const end = start.plus({ hours: 23 });
    this.managerMeetingService.getListMeetingsByOffice(officeId, start, end)
      .subscribe(resp => {
        this.meetings = resp.workload;
      })
  }

  onEventClicked(item: MeetingListItemDTO) {
    const modalRef = this.modalService.open(ModalMeetingDetailComponent, {
      width: '700px',
      customClass: 'modal-meeting-detail',
      data: {
        meeting: { ...item, users: [] },
        canEdit: item.organizerId == this.authService.currentUser.id
      }
    })

    modalRef.afterClosed$.subscribe((doReload) => {
      if (doReload) {
        this.getListMeetingsByOffice(this.meetingRoom.id);
      }
    })
  }

  onDateSelect(event: { start: Date, end: Date }) {

    const start = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(),
      this.selectedDate.getDate(), event.start.getHours(), event.start.getMinutes());

    const end = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(),
      this.selectedDate.getDate(), event.end.getHours(), event.end.getMinutes());

    const model = <MeetingDetailDTO>{
      startDate: start,
      endDate: end,
      officeId: this.meetingRoom.id,
      id: null,
      name: null,
      organizerId: this.authService.currentUser.id,
      organizer: new MeetingOrganizerDTO(this.authService.currentUser),
      users: []
    };

    const modalRef = this.modalService.open(ModalMeetingDetailComponent, {
      width: '800px',
      customClass: 'modal-meeting-detail',
      data: {
        meeting: model,
        canEdit: true
      }
    })

    modalRef.afterClosed$.subscribe((doReload) => {
      if (doReload) {
        this.getListMeetingsByOffice(this.meetingRoom.id);
      }
    })
  }

}
