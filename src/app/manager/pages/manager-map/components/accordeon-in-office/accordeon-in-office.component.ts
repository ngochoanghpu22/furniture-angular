import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Building, IconOfficeColor, Location, Location_InOffice_Name, User } from '@flex-team/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'manager-map-accordeon-in-office',
  templateUrl: './accordeon-in-office.component.html',
  styleUrls: ['./accordeon-in-office.component.scss']
})
export class AccordeonInOfficeComponent implements OnInit, OnChanges, OnDestroy {

  @Input() selectedDate: Date;
  @Input() users: User[];

  showDetail = true;

  buildings: Building[] = [];
  nbUsers: number;

  officeLocation: Location;

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.officeLocation = new Location();
    this.officeLocation.name = Location_InOffice_Name;
    this.officeLocation.color = IconOfficeColor;
  }

  ngOnInit() {
    this.activatedRoute.data.pipe(takeUntil(this._destroyed)).subscribe((data) => {
      this.buildings = data.buildings.workload;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.users && changes.users.currentValue) {
      this.nbUsers = this.users.filter(x => x.isOnboarded).length;
    }
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  onBuildingClicked(buildingId: string) {
    this.router.navigate([`./manager/plan/${buildingId}`]);
  }

  trackByFn(index: number, item: Building): string {
    return item.id;
  }


}
