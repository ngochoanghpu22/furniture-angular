import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaceholderLoadingComponent } from './placeholder-loading.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [PlaceholderLoadingComponent],
  exports: [PlaceholderLoadingComponent],
})
export class PlaceholderLoadingModule { }
