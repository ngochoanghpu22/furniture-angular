import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  BaseSwiperCalendarComponent, EditQuickDisplayComponent,
  ModalService
} from '@design-system/core';
import {
  AuthenticationService,
  Day, DayClickedEvent, PlanService, SelectionItem, SelectionPayload,
  SelectionService, StaticDataService, Week
} from '@flex-team/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})
export class PlanComponent extends BaseSwiperCalendarComponent {

  public monthStatus: Week[] = [];

  // When selected day
  public selectedWeek: Week = new Week();
  public selectedDay: Day = new Day();

  // Handle UI
  public selectDay: boolean = false;

  constructor(
    protected cd: ChangeDetectorRef,
    protected selectionService: SelectionService,
    private planService: PlanService,
    private staticDataService: StaticDataService,
    private router: Router,
    private ngZone: NgZone,
    private activatedRoute: ActivatedRoute,
    private authService: AuthenticationService,
    private modalService: ModalService) {
    super(cd, selectionService);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.getCurrentSelection();
  }

  openModalById(id: string) {
    const componentType = this.componentList[id];
    this.modalService.open(componentType, {
      width: 'auto'
    });
  }

  openModalEditQuickDisplay() {
    const modalRef = this.modalService.open(EditQuickDisplayComponent, {
      width: '80%',
      overflowYInitial: true
    });
    modalRef.afterClosed$.subscribe((resp: any) => {
      this.modalClosed(resp);
    })
  }

  onChipClicked(item: SelectionItem) {
    if (item.isAllCompanyOrFavorites) {
      return;
    }

    this.selectionService.switchActivate(item)
      .subscribe(resp => {
        if (!resp.errorCode) {
          this._treatSelectionPayload(resp.workload);
        }
      });
  }

  modalClosed(resp: any) {
    this._reload();
  }

  getCurrentSelection() {
    this.selectionService.getCurrentSelection()
      .subscribe(resp => {
        if (!resp.errorCode) {
          this._treatSelectionPayload(resp.workload);
        }
      });
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  private _reload() {
    this.getCurrentSelection();
  }

  public paginateData = (index: number) => {

    const target = DateTime.now().plus({ months: index - this.centeredPageIndex });

    this.planService.getMonthStatus(target.year, target.month)
      .subscribe(
        data => {
          if (!data.errorCode) {
            this.slides[index] = [];
            data.workload.forEach(c => this.slides[index].push(c));
          }
        },
        _ => { });
  }

  onSlideChange() {

    if (this.swiperCmp?.swiperRef != null) {

      this.pageIndex = this.activeIndex;

      this.currentDate = DateTime.now().plus({
        month: this.pageIndex - this.centeredPageIndex
      });

      this.month = this.currentDate.toFormat("LLLL");
      this.year = this.currentDate.year.toString();

      this.paginateData(this.pageIndex);
      this.paginateData(this.pageIndex - 1);
      this.paginateData(this.pageIndex + 1);

      this.activeDayInCalendar = this.pageIndex == this.centeredPageIndex ? DateTime.now().day : 0;

      this.updateChangesInView();

      this.cd.detectChanges();

    }
  }


  onDayClick(event: DayClickedEvent): void {
    const { day, week } = event;
    this.ngZone.run(() => {
      this.staticDataService.targetJSDate = new Date((<any>day[0]).dayDate);
      const modeManager = this.activatedRoute.snapshot.data.modeManager;
      const urlPlan = modeManager ? './manager/dashboard' : './plan-select-day';
      this.router.navigate([urlPlan])
    });
  }

  private _treatSelectionPayload(payload: SelectionPayload, doNotif?: boolean) {
    let items = payload.items;
    if (payload.isAllCompany) {
      items = [SelectionItem.factoryAllCompanySelectionItem(this.authService.currentUser.companyName)];
    } else if (payload.isFavorites) {
      items = [SelectionItem.factoryFavoritesSelectionItem()];
    }
    this.currentSelection = payload;
    this.currentSelection.items = items;


  }



}
