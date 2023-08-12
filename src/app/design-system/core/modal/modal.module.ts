import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormlyModule } from '@ngx-formly/core';
import { SettingAddUserTeamModule } from '../add-user-team';
import { TranslocoRootModule } from '../transloco';
import {
  ModalAddEditComponent,
  ModalAlertMessageComponent,
  ModalChangeBasicInformationsComponent,
  ModalConfirmationComponent,
  ModalInformationComponent,
  ModalInviteSeatComponent,
  ModalLocationReachedMaxPlaceComponent,
  ModalToggleQuestionComponent,
  ModalUploadPictureComponent,
  ModalUploadUserExcelComponent,
  ModalWhoIsOfficeThatDayComponent,
  UserAddressComponent
} from './modal-templates';
import { ModalComponent } from './modal.component';
import { ModalService } from './modal.service';

const components = [
  ModalAlertMessageComponent,
  ModalToggleQuestionComponent,
  ModalUploadPictureComponent,
  ModalWhoIsOfficeThatDayComponent,
  ModalLocationReachedMaxPlaceComponent,
  ModalConfirmationComponent,
  ModalInformationComponent,
  ModalAddEditComponent,
  UserAddressComponent,
  ModalChangeBasicInformationsComponent,
  ModalUploadUserExcelComponent,
  ModalInviteSeatComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TranslocoRootModule,
    ReactiveFormsModule,
    SettingAddUserTeamModule,
    FormlyModule
  ],
  declarations: [...components],
  entryComponents: [ModalComponent],
  exports: [...components],
  providers: [ModalService],
})
export class ModalModule { }
