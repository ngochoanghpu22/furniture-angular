import { Component, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalConfig, ModalRef } from '@design-system/core';
import {
  Building, ManagerMapContext, ManagerMapViewService,
  ManagerOfficeService, StaticDataService
} from '@flex-team/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'manager-map-detail',
  templateUrl: './map-detail.component.html',
  styleUrls: ['./map-detail.component.scss'],
  host: {
    '[class.mode-modal]': 'modeModal'
  }
})
export class ManagerMapDetailComponent implements OnInit {

  modeModal: boolean;
  building: Building;
  selectedDate: Date;
  targetUserId: string;

  buildings: Building[];
  state: any;

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private managerOfficeService: ManagerOfficeService,
    private managerMapViewService: ManagerMapViewService,
    private staticDataService: StaticDataService,
    @Optional() private modalRef: ModalRef,
    @Optional() public modalConfig: ModalConfig
  ) {

    this.modeModal = modalConfig?.data?.modeModal;
    this.targetUserId = modalConfig?.data.targetUserId;

    if (modalConfig?.data?.seat) {
      this.managerMapViewService.clickedUserId = this.targetUserId;
    }

    if (this.modeModal) {
      this.selectedDate = modalConfig?.data?.date.toJSDate();
      this._initializeModeModal();
    } else {
      this._initializeModePage();
    }
  }

  ngOnInit() {
  }

  /**
   * Handler building clicked
   * @param building 
   */
  onBuildingClicked(building: Building) {
    this.building = building;
  }

  /**
   * Handler book succeeded
   * @param $event 
   */
  onBookSucceeded() {
    this.staticDataService.notifyUserProfileChanged();
  }

  /**
   * Initialize mode page
   * @param modeModal
   */
  private _initializeModePage() {
    const currentNavigation = this.router.getCurrentNavigation();
    this.state = currentNavigation?.extras?.state;
    if (this.state) {
      this.managerMapViewService.updateState(this.state);
    }

    const selectedBuildingId = this.activatedRoute.snapshot.params.id;
    this.activatedRoute.data.pipe(takeUntil(this._destroyed)).subscribe((data) => {
      this.buildings = data.buildings.workload;
      this.building = this.buildings.find(x => x.id == selectedBuildingId) || this.buildings[0];
    });

    this.managerMapViewService.context$.pipe(takeUntil(this._destroyed))
      .subscribe((context: ManagerMapContext) => {
        if (!this.selectedDate || this.selectedDate.getTime() != context.date.getTime()) {
          this.selectedDate = context.date;
        }
      })

  }

  /**
   * Initialize mode modal
   * @param modeModal
   */
  private _initializeModeModal() {
    this.staticDataService.isModalMapDetailDisplayed = true;
    this.managerOfficeService.getBuildings().subscribe((resp) => {
      this.buildings = resp.workload;
      this.building = this.buildings[0];
    })
  }

  /**
   * Close modal
   * @param $event 
   */
  private _closeModal($event: any) {
    this.modalRef.close($event);
  }


}
