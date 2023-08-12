import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalConfig } from '../../modal-config';
import { ModalRef } from '../../modal-ref';

@Component({
  selector: 'fxt-modal-confirmation',
  templateUrl: './modal-confirmation.component.html',
  styleUrls: ['./modal-confirmation.component.scss']
})
export class ModalConfirmationComponent implements OnInit {

  /** Message to display */
  message: SafeHtml;
  /** If true, modal is just for information, no need to confirm */
  forceConfirm: boolean; 

  constructor(private modalRef: ModalRef, private sanitizer: DomSanitizer,
    private config: ModalConfig) {
    const message = this.config.data?.message || 'Are you sure ?';
    this.forceConfirm = this.config.data?.forceConfirm;
    this.message = this.sanitizer.bypassSecurityTrustHtml(message);
  }

  ngOnInit() {
  }

  confirm() {
    const ok = this.forceConfirm ? null : true;
    this.modalRef.close(ok);
  }

  cancel() {
    this.modalRef.close(null);
  }

}
