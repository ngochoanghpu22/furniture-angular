import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from './notification.component';
import { TranslocoRootModule } from '@design-system/core';

@NgModule({
  imports: [
    CommonModule,
    TranslocoRootModule
  ],
  declarations: [NotificationComponent],
  exports: [NotificationComponent]
})
export class NotificationModule { }
