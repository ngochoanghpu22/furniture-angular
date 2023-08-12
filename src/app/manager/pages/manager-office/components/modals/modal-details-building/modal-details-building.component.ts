import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalConfig, ModalRef, ModalSearchGooglemapLocationComponent, ModalService } from '@design-system/core';
import { AuthenticationService, Building, FileService, Floor, LocationService, ManagerOfficeService, MessageService, StaticDataService } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { DateTime } from 'luxon';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, takeUntil } from 'rxjs/operators';
import { ArchiveConfirmationModalComponent } from 'src/app/manager/components';
import { ManagerOfficeViewService } from '../../../services/manager-office-view.service';

@Component({
  selector: 'app-modal-details-building',
  templateUrl: './modal-details-building.component.html',
  styleUrls: ['./modal-details-building.component.scss']
})
export class ModalDetailsBuildingComponent implements OnInit, OnDestroy {

  @ViewChild('inputName', { static: true }) inputRef: ElementRef | null = null;

  building: Building;
  selectedDate = new Date();

  dateInView: DateTime = DateTime.fromJSDate(this.selectedDate);

  floors: any[] = [];

  displayCalendar = false;
  isEditMode = false;

  dateCustomClasses: any[] = [];

  bsConfig: Partial<BsDatepickerConfig> = {
    showWeekNumbers: false,
    containerClass: 'theme-default',
    daysDisabled: [6, 0],
    customTodayClass: 'today',
    isAnimated: false
  }

  isDatePickerInitialized = false;

  _nextButtonEl: HTMLElement;
  _prevButtonEl: HTMLElement;

  formatDate: string;

  loading = true;
  consolidatedActualLoad: number;
  private _destroyed: EventEmitter<void> = new EventEmitter<void>();

  constructor(private config: ModalConfig,
    private modalRef: ModalRef,
    private managerOfficeViewService: ManagerOfficeViewService,
    private locationService: LocationService,
    private staticDataService: StaticDataService,
    private elementRef: ElementRef,
    private modalService: ModalService,
    private fileService: FileService,
    private translocoService: TranslocoService,
    private messageService: MessageService,
    private cd: ChangeDetectorRef,
    private authService: AuthenticationService,
    private managerOfficeService: ManagerOfficeService) {
    this.building = this.config.data.building;
    const now = new Date();
    const twoDaysAhead = new Date();
    twoDaysAhead.setDate(now.getDate() + 2);
    const fourDaysAhead = new Date();
    fourDaysAhead.setDate(now.getDate() + 4);

    this.dateCustomClasses = [];
    this.formatDate = this.authService.formatDate;

  }

  ngOnInit() {
    this.loadFloors();

    fromEvent(this.inputRef?.nativeElement, 'keyup')
      .pipe(
        takeUntil(this._destroyed),
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe(_ => {
        const value = this.inputRef?.nativeElement.value.trim();
        if (this.building.name !== value) {
          this.building.name = value;
          this.save();
        }
      });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  onBsValueChange(event: any) {
    if (this.selectedDate != event) {
      this.selectedDate = event;
      this.dateInView = DateTime.fromJSDate(this.selectedDate);
      this.displayCalendar = false;
      this.isDatePickerInitialized = false;
      this.loadFloors();
    }
  }

  toggleCalendar() {
    this.displayCalendar = !this.displayCalendar;
    if (this.displayCalendar) {
      this.getLocationLoadBetweenDate(DateTime.fromJSDate(this.selectedDate));
    } else {
      this.isDatePickerInitialized = false;
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  exportXls() {
    this.managerOfficeService.getExcelUsersOnSite(this.building.id, DateTime.fromJSDate(this.selectedDate))
      .subscribe((s) => {
        this.fileService.downloadFile(s, "UserBySite.xlsx");
      });
  }

  archive() {
    const modalRef = this.modalService.open(ArchiveConfirmationModalComponent, {
      width: '400px',
      data: {
        name: this.building.name,
        type: this.translocoService.translate('main.building')
      }
    })
    modalRef.afterClosed$.subscribe((result) => {
      if (result && result.ok) {
        this.managerOfficeService.archiveBuilding({
          id: this.building.id,
          archiveDate: result.value
        })
          .subscribe(r => {
            if (r.errorCode === '') {
              this.close({ archived: true });
            }
          });
      }
    });
  }

  goToFloor(floor: Floor) {
    this.managerOfficeViewService.building = this.building;
    this.managerOfficeViewService.floor = floor;
    this.close();
  }

  openModalGoogleMapSearchBox() {
    const modalRef = this.modalService.open(ModalSearchGooglemapLocationComponent, {
      width: '80%',
      height: '450px',
      data: { lat: this.building.lat, lng: this.building.lng }
    });

    modalRef.afterClosed$.subscribe(resp => {
      if (resp) {
        const hasChanges = this.building.lat !== resp.lat || this.building.lng !== resp.lng;
        if (hasChanges) {
          this.building.lat = resp.lat;
          this.building.lng = resp.lng;
          this.building.location = resp.location;
          this.save();
        }
      }
    })
  }

  private save() {
    this.managerOfficeService.addOrEditBuilding(this.building)
      .subscribe(_ => {
        this.messageService.success();
        this.cd.detectChanges();
      });
  }

  private loadFloors() {
    this.loading = true;
    const target = DateTime.fromJSDate(this.selectedDate);
    this.locationService.getLocationLoadBetweenDate(this.building.id, target, target)
      .pipe(finalize(() => this.loading = false))
      .subscribe(resp => {
        this.floors = this.factoryFloors(resp.workload);
      })
  }

  private close(result?: any) {
    this.modalRef.close(result);
  }

  private getLocationLoadBetweenDate(target: DateTime) {

    const datesInMonth = this.factoryDateCustomClasses(target);

    this.locationService.getLocationLoadBetweenDate(this.building.id, datesInMonth[0], datesInMonth[datesInMonth.length - 1])
      .subscribe((data: any) => {
        const actualLoads: number[] = data.workload.actualLoad;
        const dateCustomClasses: any[] = [];
        actualLoads.forEach((al: number, index: number) => {
          const isOverload = al > this.building.allowedLoad || this.checkOverloadInChildren(data.workload.children, index);
          const classes = [];
          if (isOverload) {
            classes.push('date-is-overload');
          }
          dateCustomClasses.push({ date: datesInMonth[index].toJSDate(), classes: classes });
        });

        this.dateCustomClasses = dateCustomClasses;
        this.isDatePickerInitialized = true;

      })
  }

  onCalendarNavigated(next: boolean) {

    this.isDatePickerInitialized = false;

    this.dateInView = next ? this.dateInView.plus({ month: 1 }) : this.dateInView.minus({ month: 1 });
    this.getLocationLoadBetweenDate(this.dateInView);

  }


  private addEventListeners() {
    this._prevButtonEl = this.elementRef.nativeElement.querySelector('.bs-datepicker-head button.previous');
    this._nextButtonEl = this.elementRef.nativeElement.querySelector('.bs-datepicker-head button.next');
    this._prevButtonEl.addEventListener('click', this.onCalendarNavigated.bind(this, false));
    this._nextButtonEl.addEventListener('click', this.onCalendarNavigated.bind(this, true));
  }

  private removeEventListeners() {
    this._prevButtonEl.removeEventListener('click', this.onCalendarNavigated.bind(this, false));
    this._nextButtonEl.removeEventListener('click', this.onCalendarNavigated.bind(this, true));
    this._prevButtonEl = null;
    this._nextButtonEl = null;
  }

  private checkOverloadInChildren(children: any[], dayIndex: number): boolean {
    if (children.length == 0) return false;
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (c.actualLoad[dayIndex] > c.maxPerson) return true;
      let ovrl = this.checkOverloadInChildren(c.children, dayIndex);
      if (ovrl) return true;
    }
    return false;
  }

  private factoryDateCustomClasses(target: DateTime): DateTime[] {
    return this.staticDataService.getDatesOfMonthForGivenDate(target, 1);
  }

  private factoryFloors(dto: any): any[] {
    const floors: Partial<Floor>[] = [];
    this.building.actualLoad = dto.actualLoad[0];
    this.building.address = dto.address;

    this.consolidatedActualLoad = dto.actualLoad.map((x: any) => Object.values(x)[0]);

    dto.children.forEach((item: any, index: number) => {
      const floor: any = {
        id: item.id,
        actualLoad: item.actualLoad[0],
        address: item.address,
        name: item.name,
        allowedLoad: item.maxPlaceAvailable,
        capacity: item.maxPerson,
        offices: []
      }

      item.children.forEach((item2: any, index2: number) => {
        const office: any = {
          id: item2.id,
          actualLoad: item2.actualLoad[0],
          address: item2.address,
          name: item2.name,
          allowedLoad: item2.maxPlaceAvailable,
          capacity: item2.maxPerson,
          users: []
        }
        floor.offices.push(office);
      })

      floors.push(floor);
    });
    return floors;
  }

}
