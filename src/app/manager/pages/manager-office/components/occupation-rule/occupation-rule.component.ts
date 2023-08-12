import { Component, Input, OnInit } from '@angular/core';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import {
  AuthenticationService,
  FormatDates,
  ManagerOfficeService, MessageService, OccupationRule, OccupationRuleItem,
  OccupationType, Office, StaticDataService
} from '@flex-team/core';
import { DateTime } from 'luxon';
import { finalize } from 'rxjs/operators';
import { ModalAddOccupationRuleComponent } from '../modals';

@Component({
  selector: 'fxt-manager-office-occupation-rule',
  templateUrl: './occupation-rule.component.html',
  styleUrls: ['./occupation-rule.component.scss']
})
export class OccupationRuleComponent implements OnInit {

  @Input() office: Office;

  OccupationTypeEnum = OccupationType;

  days: string[] = [];
  dates: DateTime[] = [];

  currentDate: DateTime;
  loading = true;

  occupationRules: OccupationRule[][];

  constructor(
    private staticDataService: StaticDataService,
    private authService: AuthenticationService,
    private modalService: ModalService,
    private messageService: MessageService,
    private managerOfficeService: ManagerOfficeService
  ) {
    this.days = this.staticDataService.getWorkingDays({ long: true });
  }

  ngOnInit() {
    this.updateListDates(this.initTargetDate());
    this.currentDate = this.dates[0];
    this.getOccupationRulesOfWeek();
  }

  getOccupationRulesOfWeek() {
    this.loading = true;
    this.managerOfficeService.getOccupationRulesOfWeek(this.office.id, this.currentDate)
      .pipe(finalize(() => this.loading = false))
      .subscribe(resp => {
        this.occupationRules = resp.workload;
      })
  }

  showModalAddOccupationRule(dayIndex: number, ruleItem: OccupationRule, item: OccupationRuleItem) {

    const model = item
      ? <OccupationRule>{
        id: ruleItem.id,
        date: this.dates[dayIndex].toJSDate(),
        type: ruleItem.type,
        recurrence: ruleItem.recurrence,
        items: ruleItem.items,
        numberWeeks: ruleItem.numberWeeks
      }
      : <OccupationRule>{
        date: this.dates[dayIndex].toJSDate(),
      }

    const modalRef = this.modalService.open(ModalAddOccupationRuleComponent, {
      width: '600px',
      disableClose: true,
      data: {
        officeId: this.office.id,
        model: model
      }
    });

    modalRef.afterClosed$.subscribe((doReload) => {
      if (doReload) {
        this.getOccupationRulesOfWeek();
      }
    })
  }

  prev() {
    this.navigate(-1);
  }

  next() {
    this.navigate(1);
  }

  removeOnlyOccurrence(dayIndex: number, ruleItem: OccupationRule, itemToRemove: OccupationRuleItem) {
    const modalRef = this.modalService.open(ModalConfirmationComponent, {
      width: 'auto'
    });

    modalRef.afterClosed$.subscribe(isOk => {
      if (isOk) {
        this.managerOfficeService.removeOnlyOccupationRuleItem(itemToRemove.id).subscribe(() => {
          this.messageService.success();
          const ruleItemIndex = this.occupationRules[dayIndex].findIndex(x => x.id == ruleItem.id);
          this.occupationRules[dayIndex][ruleItemIndex].items = this.occupationRules[dayIndex][ruleItemIndex].items
            .filter(x => x.id !== itemToRemove.id);
        })
      }
    })
  }

  editSerie(dayIndex: number, ruleItem: OccupationRule, item: OccupationRuleItem) {
    this.showModalAddOccupationRule(dayIndex, ruleItem, item);
  }

  /**
   * Init target date. Normally it is today, if Sunday or Saturday, return next monday
   * @returns 
   */
  private initTargetDate(): DateTime {
    let now = DateTime.now();
    if (now.weekday == 6 || now.weekday == 7) {
      now = now.plus({ days: 8 - now.weekday });
    }
    return now;
  }

  private navigate(offset: number) {
    this.currentDate = this.currentDate.plus({ week: offset });
    this.updateListDates(this.currentDate);
    this.getOccupationRulesOfWeek();
  }

  private updateListDates(date: DateTime) {
    this.dates = this.staticDataService.getDatesOfWeekForGivenDate(date, {
      long: true,
      includeWeekend: false
    });

    const formatDate = this.authService.formatDate;
    const toFormat = formatDate == FormatDates.MMddyyyy ? "LLL dd" : "dd LLL";

    this.days = this.dates.map(x => {
      return `${x.weekdayShort} ${x.toFormat(toFormat)}`;
    });
  }

}
