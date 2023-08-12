import { Component, QueryList, ViewChildren } from '@angular/core';
import { LocationSelectorComponent } from '@design-system/core';
import {
  AuthenticationService, Location, LocationChangedEvent,
  LocationService, Location_Non_Defined_Name, SelectionItem, StaticDataService
} from '@flex-team/core';
import { OnboardingViewService } from '../../services';
import { BaseStepComponent } from '../base-step.component';

@Component({
  selector: 'fxt-step-three',
  templateUrl: './step-three.component.html',
  styleUrls: ['./step-three.component.scss']
})
export class StepThreeComponent extends BaseStepComponent {
  @ViewChildren('locationSelector') locationSelectors: QueryList<LocationSelectorComponent>;
  public selectedLocation: any[] = [];

  public locations: Location[] = [];

  public currentSelection: SelectionItem[] = [];

  public days: string[] = [];
  isAllDefined = false;

  constructor(
    private authService: AuthenticationService,
    private locationService: LocationService,
    private staticDataService: StaticDataService,
    private viewService: OnboardingViewService) {
    super(authService, viewService);
    this.days = this.staticDataService.getWorkingDays({ long: true });
  }

  ngOnInit() {
    super.ngOnInit();
    this.step = this.isOnlyUser ? 3 : 4;

    this.selectedLocation = this._viewService.selectedLocation;
    this.checkIsAllDefined();
    this.getLocations();

  }

  onToggle(value: any, index: number) {
    this.locationSelectors.forEach((l, i) => {
      if (l.dropdown.isOpen && i !== index) {
        l.dropdown.toggle();
      }
    })
  }

  onChangeLocation(index: number, $event: LocationChangedEvent) {
    const found = this.staticDataService.findLocationById(this.locations, $event.location.id);
    if (found) {
      this.selectedLocation[index] = found;
    }
    this.checkIsAllDefined();
  }

  private getLocations() {
    const now = new Date();
    const token = this.viewService.onboardingToken;

    this.locationService.getLocationsBetweenDate(now, now, token).subscribe((data) => {
      if (!data.errorCode) {
        this.locations = this.locationService.flattenLocationsAndHideArchived(data.workload);
      }
    });
  }

  private checkIsAllDefined() {
    this.isAllDefined = this.selectedLocation.find(x => x.name == Location_Non_Defined_Name) == null;
  }

}
