import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapInfoBlockUsersComponent } from './map-info-block-users.component';
import { CustomAvatarModule } from '../../avatar';
import { PlaceholderLoadingModule } from '../../placeholder-loading';
import { TranslocoRootModule } from '../../transloco';

@NgModule({
  imports: [
    CommonModule,
    CustomAvatarModule,
    PlaceholderLoadingModule,
    TranslocoRootModule
  ],
  declarations: [MapInfoBlockUsersComponent],
  exports: [MapInfoBlockUsersComponent],
})
export class MapInfoBlockUsersModule { }
