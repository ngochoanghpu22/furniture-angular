import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { NavbarComponent } from "./shared/layout/navbar/navbar.component";

const routes: Routes = [
  {
    path: 'sign-in',
    loadChildren: () => import('../app/login').then(m => m.LoginModule)
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
  {
    path: 'profile',
    loadChildren: () => import('../app/profile').then(m => m.ProfileModule)
  },
  {
    path: 'about-us',
    loadChildren: () => import('../app/about-us').then(m => m.AboutUsModule)
  },
];


@NgModule({
  declarations: [
    //NavbarComponent
  ],
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
