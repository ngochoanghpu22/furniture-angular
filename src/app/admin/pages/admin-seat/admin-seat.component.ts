import { Component, OnInit } from '@angular/core';
import { ModalAddEditComponent, ModalService } from '@design-system/core';
import { AddSeatDTO, AdminService, Building, Company, Floor, ManagerMeetingService, ManagerOfficeService, ManagerSeatService, MeetingRoomCoordinate, MeetingRoomDTO, MessageService, Office, Seat, SeatArchitecture } from '@flex-team/core';
import { finalize } from 'rxjs/operators';
import { AdminCompanyViewService } from '../../services/admin-company-view.service';

@Component({
  selector: 'app-admin-seat',
  templateUrl: './admin-seat.component.html',
  styleUrls: ['./admin-seat.component.scss'],
  providers: [AdminCompanyViewService]
})
export class AdminSeatComponent implements OnInit {

  selectedCompany: Company | null;
  selectedBuilding: Building | null;
  selectedFloor: Floor | null;

  loading = false;
  floorId = '';
  hasChanges = false;
  seatArchitecture: SeatArchitecture;

  seatsToUpdate: Seat[] = [];
  meetingRoomsToUpdate: MeetingRoomDTO[] = [];

  meetingRooms: MeetingRoomDTO[];

  offices: Office[] = [];

  constructor(
    private adminCompanyViewService: AdminCompanyViewService,
    private messageService: MessageService,
    private adminService: AdminService,
    private managerMeetingService: ManagerMeetingService,
    private managerSeatService: ManagerSeatService,
    private modalService: ModalService,
    private managerOfficeService: ManagerOfficeService) {
  }

  ngOnInit() {
    this.adminCompanyViewService.company$.subscribe(data => {
      this.selectedCompany = data;
    })
  }

  onFloorChanged(floor: Floor) {
    this.selectedFloor = floor;
    this.getSeatArchitecture(floor.id);
    this.getMeetingRooms(floor.id);
    this.getOfficesByFloor(floor.id);
    this.floorId = floor.id;
  }

  uploadArchitecture(files: any) {
    if (files.length === 0)
      return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    var reader = new FileReader();
    // this.selectedFile = files[0];
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.managerSeatService.uploadArchitectureSeat(this.floorId, reader.result).subscribe(r => {
        if (r.errorMessage === '') {
          this.messageService.success('Success');
          this.getSeatArchitecture(this.floorId);
          return;
        }
        this.messageService.error('main.MAX_IMAGE_SIZE_ERROR');
      })
    }
  }

  onMapSeatsChanged($event: {
    seats: Seat[],
    meetingRooms: MeetingRoomDTO[]
  }) {
    this.seatsToUpdate = $event.seats;
    this.meetingRoomsToUpdate = $event.meetingRooms;
    this.hasChanges = this.seatsToUpdate.length + this.meetingRoomsToUpdate.length > 0;
  }

  saveChanges() {

    this.managerOfficeService.updateCoordinates(this.selectedFloor.id, this.seatsToUpdate,
      this.meetingRoomsToUpdate)
      .pipe(finalize(() => {
        this.hasChanges = false;
        this.meetingRoomsToUpdate = [];
        this.seatsToUpdate = [];
      }))
      .subscribe(_ => {
        this.messageService.success();
      })
  }

  private getSeatArchitecture(floorId: string) {
    this.loading = true;
    this.managerSeatService.getSeatArchitecture(floorId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp) => {
          this.seatArchitecture = resp.workload;
        },
      });
  }

  private getMeetingRooms(floorId: string) {
    this.managerMeetingService.getMeetingRoomsOfFloor(floorId).subscribe(resp => {
      this.meetingRooms = resp.workload.map(x => {
        if (x.coordinate == null) {
          x.coordinate = <MeetingRoomCoordinate>{
            xParam: 0,
            yParam: 0
          }
        }
        return x;
      });
    })
  }

  private getOfficesByFloor(floorId: string) {
    this.managerOfficeService.getOfficesByFloor(floorId).subscribe((resp: any) => {
      this.offices = resp.workload;
    })
  }

  clickAddSeat() {
    const optionOffices = this.offices.map((office) => ({
      value: office.id,
      label: office.name,
    }))
    const dataFields = [
      {
        key: 'name',
        type: 'input',
        templateOptions: {
          label: 'Name',
          placeholder: 'Enter name',
          required: true,
        },
      },
      {
        key: 'officeId',
        type: 'select',
        templateOptions: {
          label: 'Office',
          options: optionOffices,
          required: true,
        },
      },
    ]

    const modalRef = this.modalService.open(ModalAddEditComponent, {
      width: 'auto',
      disableClose: true,
      data: {
        model: new AddSeatDTO(),
        fields: dataFields
      },
    });
    modalRef.afterClosed$.subscribe((resp) => {
      if (resp && resp.model) {
        this.managerSeatService.addOrEditSeat(this.floorId, resp.model).subscribe(r => {
          this.messageService.success();
          this.seatArchitecture.seats.push(r.workload)
        })
      }
    });
  }
}
