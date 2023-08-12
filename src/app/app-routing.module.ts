import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import {
  AdminGuard, LoginGuard, ManagerGuard,
  OnboardingGuard, SelectPlanGuard, ResetPasswordGuard, PlanSelectDayResolver
} from "@flex-team/core";

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('../app/login').then(m => m.LoginModule)
  },
  {
    path: 'plan',
    loadChildren: () => import('../app/plan').then(m => m.PlanModule),
    canActivate: [LoginGuard]
  },
  // {
  //   path: 'user',
  //   loadChildren: () => import('../app/user').then(m => m.UserModule),
  //   //canActivate: [LoginGuard]
  // },
  {
    path: 'onboarding',
    loadChildren: () => import('../app/onboarding').then(m => m.OnboardingModule),
    //canActivate: [OnboardingGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('../app/dashboard').then(m => m.DashboardModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('../app/profile').then(m => m.ProfileModule),
    canActivate: [LoginGuard]
  },
  {
    path: 'plan-select-day',
    loadChildren: () => import('../app/plan-select-day').then(m => m.SelectedDayModule),
    canActivate: [LoginGuard, SelectPlanGuard],
    resolve: {
      isOk: PlanSelectDayResolver
    }
  },
  {
    path: 'manager',
    loadChildren: () => import('../app/manager').then(m => m.ManagerModule),
    canActivate: [LoginGuard]
  },
  // {
  //   path: 'task-detail/:id',
  //   loadChildren: () => import('../app/manager/pages/task-detail').then(m => m.TaskDetailModule),
  //   canActivate: [LoginGuard]
  // },
  {
    path: 'dashboard',
    loadChildren: () => import('../app/dashboard').then(m => m.DashboardModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('../app/admin').then(m => m.AdminModule),
    canActivate: [LoginGuard, AdminGuard]
  },
  {
    path: '', pathMatch: 'full', redirectTo: 'login'
  },
  {
    path: 'register', loadChildren: () => import('./register/register.module').then(m => m.RegisterModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./reset-password/reset-password.module').then(m => m.ResetPasswordModule),
    canActivate: [ResetPasswordGuard]
  },
  {
    path: 'forgot-password', loadChildren: () => import('./forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule)
  },
  // {
  //   path: '**', pathMatch: 'full', redirectTo: 'dashboard'
  // }
];


@NgModule({
  // useHash supports github.io demo page, remove in your app
  imports: [
    RouterModule.forRoot(routes, {
      useHash: false,
      scrollPositionRestoration: 'enabled',
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
