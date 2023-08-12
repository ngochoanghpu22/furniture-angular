import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ChipModule } from '../chip';
import { SearchPersonsAutocompleteModule } from '../search-persons-autocomplete';
import { TranslocoRootModule } from '../transloco';
import { EditQuickDisplayComponent } from './edit-quick-display/edit-quick-display.component';
import { QuickPlayPickerComponent } from './quickplay-picker.component';

@NgModule({
  imports: [
    CommonModule,
    ChipModule,
    SearchPersonsAutocompleteModule,
    TranslocoRootModule
  ],
  declarations: [
    QuickPlayPickerComponent,
    EditQuickDisplayComponent
  ],
  exports: [
    QuickPlayPickerComponent,
    EditQuickDisplayComponent]
})
export class QuickPlayPickerModule { }
