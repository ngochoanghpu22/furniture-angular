import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CustomAvatarModule } from '../avatar';
import { ChipModule } from '../chip';
import { DirectivesModule } from '../directives';
import { QuickPlayPickerModule } from '../quickplay-picker';
import { TranslocoRootModule } from '../transloco';
import { SearchBarComponent } from './search-bar.component';

@NgModule({
  imports: [
    CommonModule,
    TranslocoRootModule,
    DirectivesModule,
    QuickPlayPickerModule,
    CustomAvatarModule,
    ChipModule,
  ],
  declarations: [
    SearchBarComponent
  ],
  exports: [SearchBarComponent],
})
export class SearchBarModule { }
