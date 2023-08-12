import { Directive, ElementRef, HostBinding, Input, OnInit } from '@angular/core';
import { FileService } from '../../../core';

const Image_Size_Default = 100;

const Avatar_Default = 'assets/icons/user.svg';
const Base64_Prefix = 'data:image/png;base64,';

@Directive({
  selector: 'img[fxtImageLinkApi]'
})
export class ImageLinkApiDirective implements OnInit {

  @Input() set image(val: string | null) {
    let src = Avatar_Default;
    if (val) {
      let prefix = '';
      if (val.indexOf("/api") >= 0) {
        prefix = this._fileService.getAccessPointUrl();
      }
      else if (val.indexOf(Base64_Prefix) < 0) {
        prefix = Base64_Prefix;
      }
      src = `${prefix}${val}`;
    }
    (this._el.nativeElement as HTMLImageElement).setAttribute('src', src);
  }

  @Input() height: number;

  constructor(private _el: ElementRef, private _fileService: FileService) {
    const supports = 'loading' in HTMLImageElement.prototype;
    if (supports) {
      this._el.nativeElement.setAttribute('loading', 'lazy');
    }
  }

  ngOnInit() {
    const height = this.height || +(this._el.nativeElement.getAttribute('height')) || Image_Size_Default;
    this._el.nativeElement.setAttribute('height', `${height}px`);
  }

}
