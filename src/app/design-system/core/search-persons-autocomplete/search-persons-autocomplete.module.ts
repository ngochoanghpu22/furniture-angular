import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CustomAvatarModule } from '../avatar';
import { ChipModule } from '../chip';
import { DirectivesModule } from '../directives';
import { TranslocoRootModule } from '../transloco';
import { SearchPersonsAutocompleteComponent } from './search-persons-autocomplete.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    ChipModule,
    DirectivesModule,
    TranslocoRootModule,
    CustomAvatarModule
  ],
  declarations: [SearchPersonsAutocompleteComponent],
  exports: [SearchPersonsAutocompleteComponent]
})
export class SearchPersonsAutocompleteModule { }
