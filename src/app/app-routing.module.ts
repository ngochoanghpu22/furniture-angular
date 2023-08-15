import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { ProfileService } from "./profile/profile.service";
import { AppSettings } from "./core/constant/appSetting";
import { LocalStorageService } from "./core/service/localStorage.service";

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
    loadChildren: () => import('../app/category').then(m => m.CategoryModule)
  },
  {
    path: `${AppSettings.ROUTE.Product}/:name`,
    loadChildren: () => import('../app/product').then(m => m.ProductModule)
  },
  {
    path: `${AppSettings.ROUTE.ProductDetail}/:name`,
    loadChildren: () => import('../app/product-detail').then(m => m.ProductDetailModule)
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

const services = [ProfileService, LocalStorageService];

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
