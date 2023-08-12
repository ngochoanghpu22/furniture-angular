import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TranslocoRootModule } from '../transloco';
import { CardOfficeComponent } from './card-office.component';
import { DirectivesModule } from '../directives';
import { CollapseModule } from 'ngx-bootstrap/collapse';

@NgModule({
  imports: [
    CommonModule,
    DirectivesModule,
    FormsModule,
    TranslocoRootModule,
    BsDropdownModule,
    CollapseModule
  ],
  declarations: [CardOfficeComponent],
  exports: [CardOfficeComponent]
})
export class CardOfficeModule { }
