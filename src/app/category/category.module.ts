import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CategoryComponent } from './category.component';
import { ProductComponent } from '../product';

const routes: Routes = [
  {
    path: '',
    component: CategoryComponent,
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [CategoryComponent]
})
export class CategoryModule { }
