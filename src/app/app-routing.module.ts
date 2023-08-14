import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { ProfileService } from "./profile/profile.service";

const routes: Routes = [
  {
    path: 'sign-in',
    loadChildren: () => import('../app/sign-in').then(m => m.SignInModule)
  },
  {
    path: 'sign-up',
    loadChildren: () => import('../app/sign-up').then(m => m.SignUpModule)
  },
  {
    path: 'product',
    loadChildren: () => import('../app/product').then(m => m.ProductModule)
  },
  { 
    path: '',
    pathMatch: 'full', 
    redirectTo: 'product' 
  },
  // {
  //   path: 'profile',
  //   loadChildren: () => import('../app/profile').then(m => m.ProfileModule)
  // },
  {
    path: 'about-us',
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
