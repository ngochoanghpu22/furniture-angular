import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { LanguageLocales, ManagerFilter, ManagerViewService, SelectionItem } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ManagerCalendarFilterService } from '../../services';

@Component({
  selector: 'fxt-manager-block-filters',
  templateUrl: './block-filters.component.html',
  styleUrls: ['./block-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagerBlockFiltersComponent implements OnInit, OnDestroy {

  public todayDay: Date = new Date();

  periodText: string = '';

  filter: ManagerFilter | null = null;

  locale: string;
  tags: SelectionItem[];

  private _destroyed: Subject<void> = new Subject<void>();
  constructor(
    private managerFilterService: ManagerCalendarFilterService,
    private managerViewService: ManagerViewService,
    private cd: ChangeDetectorRef,
    private translocoService: TranslocoService) {
  }

  ngOnInit() {
    this.managerFilterService.filters$
      .pipe(takeUntil(this._destroyed))
      .subscribe(val => {
        this.filter = val;
        this.periodText = this.filter.periodText;
        this.tags = this.filter.selection;
        this.cd.detectChanges();
      });

    this.translocoService.langChanges$
      .pipe(takeUntil(this._destroyed)).subscribe((lang) => {
        this.locale = LanguageLocales[lang];
      });

  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  prev() {
    this.managerFilterService.prev();
  }

  next() {
    this.managerFilterService.next();
  }

  onSelectionChanged(selection: SelectionItem[]) {
    this.managerViewService.selection = selection;
  }

}

