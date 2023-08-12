import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Building, ManagerMapViewService, ManagerOfficeService, UserPresenceDto } from '@flex-team/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'fxt-manager-map-card-building',
  templateUrl: './card-building.component.html',
  styleUrls: ['./card-building.component.scss'],
  host: {
    '(click)': 'clicked.emit(building.id)'
  }
})
export class CardBuildingComponent implements OnInit, OnChanges, OnDestroy {

  @Input() selectedDate: Date;
  @Input() building: Building;

  users: UserPresenceDto[];

  @Output() clicked = new EventEmitter<string>();

  highlightUserIds: string[] = [];
  highlightUserIdsObj: { [key: string]: boolean } = {};

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private managerOfficeService: ManagerOfficeService,
    private managerMapViewService: ManagerMapViewService
  ) { }

  ngOnInit() {
    this.managerMapViewService.highlightUserIds$.pipe(takeUntil(this._destroyed))
      .subscribe((data) => {
        this.highlightUserIds = data;
        this.highlightUserIdsObj = {};
        this.highlightUserIds.forEach(k => this.highlightUserIdsObj[k] = true);
        if (this.users) {
          this.sortUsers();
        }
      })
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.selectedDate && changes.selectedDate.currentValue) {
      this.getUsersForBuilding();
    }
  }

  private getUsersForBuilding() {
    this.managerOfficeService.loadUsersForBuilding(this.building.id, this.selectedDate)
      .subscribe(resp => {
        this.users = resp.workload.allUsers;
      })
  }

  private sortUsers() {
    this.users = this.users.sort((a: any, b: any) => {
      const foundA = this.highlightUserIds.indexOf(a.id) >= 0;
      const foundB = this.highlightUserIds.indexOf(b.id) >= 0;
      if (foundA) return -1;
      if (foundB) return 1;
      return 0;
    })
  }

}
