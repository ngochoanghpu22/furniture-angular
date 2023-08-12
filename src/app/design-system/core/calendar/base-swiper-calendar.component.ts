import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectionPayload, SelectionService, Week } from '@flex-team/core';
import { DateTime } from 'luxon';
import { SwiperComponent } from 'swiper/angular';
import {
  ModalAlertMessageComponent, ModalToggleQuestionComponent,
  ModalUploadPictureComponent, ModalWhoIsOfficeThatDayComponent
} from '../modal';
import { CalendarComponent } from './calendar.component';

@Component({
  selector: '',
  template: '',
  styleUrls: []
})
export abstract class BaseSwiperCalendarComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild("calendarRef") calendarRef: CalendarComponent | undefined;

  get swiperCmp(): SwiperComponent | undefined {
    return this.calendarRef?.swiperCmp;
  }

  get activeIndex(): number {
    return this.swiperCmp?.swiperRef.activeIndex || 0;
  }

  public month: string = "";
  public year: string = "";
  public NbUser: number = 0;


  public currentDate: DateTime = DateTime.now();

  public hideGauge: boolean = true;
  public slides: Array<Array<Week>> = [];
  public activeDayInCalendar: number = 0;

  public pageIndex: number = 1;

  public centeredPageIndex = 12;
  public maxNumberOfSlides = 24;

  public currentSelection: SelectionPayload;

  public componentList: { [id: string]: any; } = {
    "modal-toggle-question": ModalToggleQuestionComponent,
    "modal-alert-message": ModalAlertMessageComponent,
    "modal-upload-picture": ModalUploadPictureComponent,
    "modal-who-is-office-that-day": ModalWhoIsOfficeThatDayComponent
  }

  constructor(protected cd: ChangeDetectorRef,
    protected selectionService: SelectionService) {
    this.activeDayInCalendar = DateTime.now().day;
    this.slides = Array.from({ length: this.maxNumberOfSlides }).map((el, index) => []);
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.pageIndex = this.centeredPageIndex;
      this.swiperCmp?.swiperRef.slideTo(this.pageIndex);
      this.activeDayInCalendar = DateTime.now().day;
    });
  }

  ngOnDestroy(): void {
  }

  onNext(): void {
    this.swiperCmp?.swiperRef.slideNext();
  }

  onPrevious(): void {
    this.swiperCmp?.swiperRef.slidePrev();
  }

  onGetToday(): void {
    this.swiperCmp?.swiperRef.slideTo(this.centeredPageIndex);
    this.paginateData(this.centeredPageIndex);
    this.updateChangesInView();
  }

  trackByFn(index: number, item: any): string {
    return item.dayDate;
  }

  protected updateChangesInView() {
    this.slides = [].concat(<any>this.slides);
  }

  abstract paginateData(index: number): void;

}
