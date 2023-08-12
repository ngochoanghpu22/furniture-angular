import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AuthenticationService, ManagerMapViewService, Office, User } from '@flex-team/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'fxt-map-no-seat',
  templateUrl: './map-no-seat.component.html',
  styleUrls: ['./map-no-seat.component.scss']
})
export class MapNoSeatComponent implements OnInit, OnChanges, OnDestroy {

  @Input() floorId: string;
  @Input() offices: Office[] = [];

  currentUserId: string;
  selectedOffices: any = {};
  private _destroyed = new Subject<void>();

  @Output() selected = new EventEmitter<Office>(null);

  constructor(
    private managerMapViewService: ManagerMapViewService,
    private authService: AuthenticationService
  ) { }

  ngOnInit() {

    this.currentUserId = this.authService.currentUser.id;

    this.managerMapViewService.officeUsers$.pipe(takeUntil(this._destroyed)).subscribe(officeUsers => {
      this.selectedOffices = {};
      this.offices.forEach((o: any) => {
        const users = officeUsers[o.id] as User[] || [];
        this.selectedOffices[o.id] = users.findIndex(u => u.id === this.currentUserId) > -1;
      });
    });

  }
  ngOnChanges(changes: SimpleChanges): void {
    const { currentValue } = changes.offices;
    if (currentValue) {
      this.selectedOffices = {};
      const officeUsers = this.managerMapViewService.officeUsers;
      currentValue.forEach((o: any) => {
        const users = officeUsers[o.id] as User[] || [];
        this.selectedOffices[o.id] = users.findIndex(u => u.id === this.currentUserId) > -1;
      });
    }
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  select(office: Office) {
    if (!this.selectedOffices[office.id]) {
      this.selected.emit(office);
    }
  }

}
