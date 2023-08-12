import { Component, OnInit } from '@angular/core';
import { FxtAnimations } from '@design-system/core';
import { Notification, NotificationService, NotificationType, StaticDataService } from '@flex-team/core';

@Component({
  selector: 'fxt-center-notifications',
  templateUrl: './center-notifications.component.html',
  styleUrls: ['./center-notifications.component.scss'],
  animations: [FxtAnimations.fadeOut]
})
export class CenterNotificationsComponent implements OnInit {

  public notifications: Notification[] = [];

  constructor(private notificationService: NotificationService) { }

  ngOnInit() {
    //this.getNotifications();
  }

  trackByFn(index: number, item: Notification): string {
    return item.id;
  }

  closeNotification(id: string): void {
    this.notifications = this.notifications.filter(x => x.id !== id);
  }

  onNotificationActionClicked = (notification: Notification) => {

    this.notifications = this.notifications.filter(x => x.id !== notification.id);

    if (notification.type === NotificationType.AddTeamMember ||
      notification.type === NotificationType.RemoveTeamMember) {
      return;
    }

    const payload = JSON.parse(notification.payload);

    const goToSelectPlanPage = notification.type === NotificationType.PercentTeam ||
      notification.type === NotificationType.DayLeft;

    let targetDateJs = new Date();

    if (goToSelectPlanPage && payload.date) {
      targetDateJs = new Date(payload.date);
    }

    // this.planRef.centerToDate(targetDateJs);
  };

  private getNotifications() {
    this.notificationService.getNotifications()
      .subscribe(resp => {
        this.notifications = resp.workload;
      });
  }

}
