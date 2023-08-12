import { Component, Input, OnInit } from '@angular/core';
import { ModalService } from '@design-system/core';
import { Booking, Location, SelectionService, TeamType, User } from '@flex-team/core';
import { ModalUserProfileComponent } from 'src/app/components';
import * as _ from 'underscore';

@Component({
  selector: 'fxt-friend-locations',
  templateUrl: './friend-locations.component.html',
  styleUrls: ['./friend-locations.component.scss']
})
export class FriendLocationsComponent implements OnInit {

  @Input() currentDate: Date = new Date();
  @Input() teamType: TeamType = TeamType.Undefined;
  public friendLocations: { location: Location, bookings: Booking[], mailTarget: string | undefined }[] | null = null;

  constructor(
    private selectionService: SelectionService,
    private modalService: ModalService
    ) { }

  ngOnInit(): void {
    this.updateData();
  }

  updateData() {
    if (this.teamType != TeamType.Undefined) {
      this.selectionService.getSelectionBooking(
        this.currentDate,
        this.currentDate,
        this.teamType)
        .subscribe(dataInternal => {
          if (!dataInternal.errorCode) {
            this.friendLocations = _.chain(dataInternal.workload)
              .groupBy(l => l.location && l.location.name)
              .map((value, key) => ({ location: value[0].location, bookings: value, mailTarget: _.chain(value).map(c => c.user.email).reduce((c, d) => c + ";" + d).value() }))
              .value();
          }
        });
    }
  }

  onAvatarClicked(user: User) {
    this.modalService.open(ModalUserProfileComponent, {
      width: '550px',
      maxHeight: '85%',
      customClass: 'modal-user-profile',
      data: {
        user: user,
        hideScheduler: true
      },
    });
  }

}
