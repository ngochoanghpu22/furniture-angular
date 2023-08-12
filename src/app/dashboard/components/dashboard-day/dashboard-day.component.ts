import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Day, Location, PlanService, StaticDataService, TeamType } from '@flex-team/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'fxt-dashboard-day',
  templateUrl: './dashboard-day.component.html',
  styleUrls: ['./dashboard-day.component.scss']
})
export class DashboardDayComponent implements OnInit, OnChanges {

  public TeamTypes = TeamType;

  @Input() public title: string = "Today";
  @Input() public locations: Location[] = [];
  @Input() public currentDate: DateTime = DateTime.now();
  @Input() public teamName: string = 'My Team';

  public currentDateAsDate: Date = new Date();

  public todayDate: string = "";
  public todayLocation: Location = new Location();
  public todayDay: Day = new Day();

  _id: number;

  activeTab = 1;

  constructor(
    private planService: PlanService,
    private staticDataService: StaticDataService) { }

  ngOnInit(): void {
    this.currentDateAsDate = new Date(Date.UTC(this.currentDate.year, this.currentDate.month - 1, this.currentDate.day));
    this.todayDate = this.currentDate.toFormat("dd MMMM yyyy ");
    this._id = this.currentDate.toMillis();
    this.planService.getDayStatus(this.currentDate.year, this.currentDate.month, this.currentDate.day)
      .subscribe(data => {
        if (!data.errorCode) {
          this.todayDay = data.workload[0] || new Day();
          this.setSelectedLocation();
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["Locations"]) {
      this.setSelectedLocation();
    }
  }


  setSelectedLocation() {
    this.todayLocation = this.staticDataService.findLocationById(this.locations, this.todayDay.selectedRemoteLocationId)
      ?? new Location();
  }
}
