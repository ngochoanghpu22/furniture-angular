import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DirectivesModule } from '../directives';
import { GoogleMapSearchboxModule } from '../google-map-searchbox';
import { LocationStatusModule } from '../location-status';
import { PaletteIconModule } from '../palette-icon';
import { TranslocoRootModule } from '../transloco';
import { GeodataPreviewComponent } from './geodata-preview/geodata-preview.component';
import { ModalMetadataValuesComponent } from './modal-add-metadatavalues/modal-add-metadatavalues.component';
import { ModalLocationMetadataComponent } from './modal-location-metadata/modal-location-metadata.component';

@NgModule({
  imports: [
    CommonModule,
    TranslocoRootModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleMapSearchboxModule,
    DirectivesModule,
    PaletteIconModule,
    PopoverModule,
    TooltipModule,
    LocationStatusModule
  ],
  declarations: [
    ModalLocationMetadataComponent,
    ModalMetadataValuesComponent,
    GeodataPreviewComponent
  ],
  exports: [
    ModalLocationMetadataComponent,
    ModalMetadataValuesComponent,
    GeodataPreviewComponent
  ],
})
export class ModalMetadataModule { }
