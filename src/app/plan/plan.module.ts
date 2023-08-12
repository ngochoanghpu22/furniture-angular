import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuickPlayPickerModule, TranslocoRootModule } from '@design-system/core';
import { DesignSystemModule } from '../design-system';
import { PlanComponent } from './plan.component';

const routes: Routes = [
  {
    path: '',
    component: PlanComponent
  }
];

const components = [
  PlanComponent
]

@NgModule({
  imports: [
    CommonModule,
    DesignSystemModule,
    RouterModule.forChild(routes),
    TranslocoRootModule,
    QuickPlayPickerModule
  ],
  declarations: [
    ...components
  ]
})
export class PlanModule { }
