import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalConfig } from '../../modal-config';
import { ModalRef } from '../../modal-ref';

@Component({
  selector: 'fxt-modal-upload-user-excel',
  templateUrl: './modal-upload-user-excel.component.html',
  styleUrls: ['./modal-upload-user-excel.component.scss']
})
export class ModalUploadUserExcelComponent implements OnInit {

  ownerFullName: string = '';
  form: FormGroup = new FormGroup({});

  data: any;
  loading = false;
  hasError = false;

  submitEvent: any;
  parentcontext: any;

  constructor(private formBuilder: FormBuilder,
    private modalConfig: ModalConfig,
    private modalRef: ModalRef) {
    this.submitEvent = this.modalConfig.data.fn;
    this.parentcontext = this.modalConfig.data.context;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      userfile: [null, Validators.required],
      isInvitedByEmail: [null],
      actualFile: [null]
    });
  }

  onFileChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files;
      this.form.patchValue({
        actualFile: file
      });
    }
  }

  upload() {
    if (this.form.valid) {
      const dto = this.form.getRawValue();
      this.loading = true;
      this.close();
      this.submitEvent.call(this.parentcontext, dto.actualFile, dto.isInvitedByEmail ?? false);
    }
  }

  private close(res?: any) {
    this.modalRef.close(res);
  }
}
