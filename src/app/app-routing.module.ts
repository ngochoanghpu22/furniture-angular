import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { ProfileService } from "./profile/profile.service";
import { AppSettings } from "./core/constant/appSetting";

const routes: Routes = [
  {
    path: AppSettings.ROUTE.SignIn,
    loadChildren: () => import('../app/sign-in').then(m => m.SignInModule)
  },
  {
    path: AppSettings.ROUTE.SignUp,
    loadChildren: () => import('../app/sign-up').then(m => m.SignUpModule)
  },
  {
    path: AppSettings.ROUTE.Product,
    loadChildren: () => import('../app/product').then(m => m.ProductModule)
  },
  { 
    path: '',
    pathMatch: 'full', 
    redirectTo: AppSettings.ROUTE.Product 
  },
  {
    path: AppSettings.ROUTE.AboutUs,
    loadChildren: () => import('../app/about-us').then(m => m.AboutUsModule)
  },
];

const services = [ProfileService];

@NgModule({
  declarations: [
  ],
  providers: [...services],
  imports: [
    RouterModule.forRoot(routes, {
      useHash: false,
      scrollPositionRestoration: 'enabled',
      preloadingStrategy: PreloadAllModules
    })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
