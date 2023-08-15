import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ProductDetailComponent } from './product-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ProductDetailComponent,
    children: [
      {
        path:':name', 
        component: ProductDetailComponent
      },
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProductDetailComponent]
})
export class ProductDetailModule { }
