import { Component, OnInit } from '@angular/core';
import { ModalRef, ModalConfig } from '@design-system/core';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

@Component({
  selector: 'app-archive-confirmation-modal',
  templateUrl: './archive-confirmation-modal.component.html',
  styleUrls: ['./archive-confirmation-modal.component.scss']
})
export class ArchiveConfirmationModalComponent implements OnInit {
  bsValue = new Date();
  name: string;
  type: string;

  bsConfig: Partial<BsDatepickerConfig> = {
    showWeekNumbers: false,
    containerClass: 'theme-default',
    customTodayClass: 'today',
    isAnimated: true
  }

  constructor(
    private modalRef: ModalRef,
    private config: ModalConfig,
  ) {
    this.name = this.config.data.name;
    this.type = this.config.data.type;
  }

  ngOnInit(): void {
  }

  confirm(ok: boolean) {
    this.modalRef.close({ ok, value: this.bsValue });
  }

  toggleDropdown(event: any, dropdown: any) {
    event.stopPropagation();
    dropdown.toggle()
  }
}
