import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { ModalConfig } from '../../modal-config';
import { ModalRef } from '../../modal-ref';

@Component({
  selector: 'app-modal-add-edit',
  templateUrl: './modal-add-edit.component.html',
  styleUrls: ['./modal-add-edit.component.scss'],
})
export class ModalAddEditComponent implements OnInit {
  model: any;
  fields: FormlyFieldConfig[];
  isEdit: boolean;

  form = new FormGroup({});

  constructor(private modalRef: ModalRef, private config: ModalConfig) {
    this.model = config.data.model;
    this.fields = config.data.fields;
    this.isEdit = config.data.isEdit;
  }

  ngOnInit() { }

  onSubmit(model: any) {
    if (this.form.valid) {
      this.close({
        rawValue: this.form.getRawValue(),
        model: this.model
      });
    }
  }

  close(res?: any) {
    this.modalRef.close(res);
  }
}
