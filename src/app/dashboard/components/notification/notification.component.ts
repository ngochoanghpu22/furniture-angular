import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  NotificationLevel,
  Notification,
  NotificationService,
  NotificationType,
  StaticDataService
} from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { DateTime } from 'luxon';

@Component({
  selector: 'fxt-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnInit {
  @Input() notification: Notification = new Notification();
  @Output() closed: EventEmitter<string> = new EventEmitter();
  @Output() actionClicked: EventEmitter<Notification> = new EventEmitter();

  DateGeneration: string = '';

  public NotificationTypeEnum = NotificationType;
  public NotificationLevelEnum = NotificationLevel;
  public payload = {};

  private _currentLang: string;

  workingDays: string[];

  constructor(
    private notificationService: NotificationService,
    private translocoService: TranslocoService,
    private staticDataService: StaticDataService
  ) {
    this._currentLang = this.translocoService.getActiveLang();
  }

  ngOnInit(): void {
    if (this.notification.payload) {
      const payload = JSON.parse(this.notification.payload);
      if (payload.date) {
        payload.date = DateTime.fromISO(payload.date).toFormat('EEEE dd/MM');
      }

      if (payload.mandatoryOfficeDayIndexes && Array.isArray(payload.mandatoryOfficeDayIndexes)) {
        if (!this.workingDays) {
          this.workingDays = this.staticDataService.getWorkingDays({ long: true });
          payload.mandatoryOfficeDays = payload.mandatoryOfficeDayIndexes.map((dayIndex: number) => this.workingDays[dayIndex])
            .join(', ');
        }
      }
      this.payload = payload;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['notification'] != null) {
      this.DateGeneration =
        '' +
        DateTime.fromISO(this.notification.dateGeneration).toRelativeCalendar({
          locale: this._currentLang
        });
    }
  }

  actionNotification() {
    this.notificationService
      .closeNotification(this.notification.id)
      .subscribe(() => {
        this.actionClicked.emit(this.notification);
      });
  }

  closeNotification() {
    this.notificationService.closeNotification(this.notification.id).subscribe(
      () => {
        this.closed.emit(this.notification.id);
      }
    );
  }
}
