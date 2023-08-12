import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ModalConfig } from '../../modal-config';
import { ModalRef } from '../../modal-ref';

@Component({
  selector: 'app-modal-information',
  templateUrl: './modal-information.component.html',
  styleUrls: ['./modal-information.component.scss'],
})
export class ModalInformationComponent implements OnInit {
  message: SafeHtml;
  messageClass: string = '';
  actionLinkToShow: boolean = false;
  actionLinkFunction: Function = null;
  actionLinkMessage: string = '';
  parentContext: any;
  constructor(
    private modalRef: ModalRef,
    private sanitizer: DomSanitizer,
    private config: ModalConfig
  ) {
    const message = config.data?.message || 'Are you sure ?';
    this.message = this.sanitizer.bypassSecurityTrustHtml(message);
    this.messageClass = config.data?.messageClass || '';
    this.actionLinkToShow = config.data?.actionLinkToShow || false;
    this.actionLinkFunction = config.data?.actionLinkFunction || null;
    this.actionLinkMessage = config.data?.actionLinkMessage || '';
    this.parentContext = config.data?.parentContext || null;
  }

  ngOnInit() { }

  callActionLinkFunction() {
    this.modalRef.close();
    this.actionLinkFunction.call(this.parentContext);
  }

  confirm() {
    this.modalRef.close(null);
  }
}
