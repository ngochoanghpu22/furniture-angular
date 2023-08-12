import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class MessageService {

  constructor(
    private toastr: ToastrService,
    private translocoService: TranslocoService
  ) { }

  success(text?: string, params?: any) {
    text = text || 'notifications.your_changes_updated';
    const sub = this.translocoService.selectTranslate(text, params).subscribe((msg) => {
      this.toastr.success(msg);
    });
    sub.unsubscribe();
  }

  info(text?: string, params?: any) {
    text = text || 'notifications.your_changes_updated';
    const sub = this.translocoService.selectTranslate(text, params).subscribe((msg) => {
      this.toastr.info(msg);
    });
    sub.unsubscribe();
  }

  error(text?: string, params?: any) {
    text = text || 'notifications.an_error_occurred';
    const sub = this.translocoService.selectTranslate(text, params).subscribe((msg) => {
      this.toastr.error(msg);
    });
    sub.unsubscribe();
  }

  warn(text?: string, params?: any) {
    text = text || 'notifications.an_error_occurred';
    const sub = this.translocoService.selectTranslate(text, params).subscribe((msg) => {
      this.toastr.warning(msg);
    });
    sub.unsubscribe();
  }

  /**
   * Show detailed error in 3s
   * @param text 
   * @param params 
   */
  showDetailedError(text: string, params: any = {}) {
    const sub = this.translocoService.selectTranslate(text, params).subscribe((msg) => {
      this.toastr.error(msg, '', {
        enableHtml: true,
        timeOut: 3000
      });
    });
    sub.unsubscribe();
  }

}
