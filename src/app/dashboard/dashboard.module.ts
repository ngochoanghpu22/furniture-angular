import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TranslocoRootModule } from '@design-system/core';
import { SwiperModule } from 'swiper/angular';
import { DesignSystemModule } from '../design-system';
//import { CenterNotificationsComponent, ManagerPopoverMenuComponent, ManagerSidebarComponent } from '../manager/components';
import { FriendLocationsComponent } from './components';
import { DashboardDayComponent } from './components/dashboard-day/dashboard-day.component';
import { NotificationModule } from './components/notification';
import { DashboardComponent } from './dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    DesignSystemModule,
    SwiperModule,
    RouterModule.forChild(routes),
    TranslocoRootModule,
    NotificationModule
  ],
  declarations: [
    DashboardComponent,
    DashboardDayComponent,
    FriendLocationsComponent,
    // ManagerSidebarComponent,
    // ManagerPopoverMenuComponent,
    // CenterNotificationsComponent
  ]
})
export class DashboardModule { }
