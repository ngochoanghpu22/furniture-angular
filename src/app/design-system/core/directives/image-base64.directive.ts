import { Directive, ElementRef, HostBinding, Input, OnInit } from '@angular/core';
import { FileService } from '../../../core';

const Image_Size_Default = 40;

const Avatar_Default = 'assets/icons/no_avatar.svg';
const Base64_Prefix = 'data:image/png;base64,';

@Directive({
  selector: 'img[fxtImageBase64]',
  host: {
    'class': 'fxt-image-base64'
  }
})
export class ImageBase64Directive implements OnInit {

  @Input() set small(val: boolean | string) {
    this._small = (val === '') ? true : val as boolean;
  }
  @HostBinding('class.small') _small: boolean = false;

  @Input() set xsmall(val: boolean | string) {
    this._xsmall = (val === '') ? true : val as boolean;
  }
  @HostBinding('class.xsmall') _xsmall: boolean = false;

  @Input() set xxsmall(val: boolean | string) {
    this._xxsmall = (val === '') ? true : val as boolean;
  }
  @HostBinding('class.xxsmall') _xxsmall: boolean = false;

  @Input() set shadow(val: boolean | string) {
    this._dropShadow = (val === '') ? true : val as boolean;
  }
  @HostBinding('class.drop-shadow') _dropShadow: boolean = false;

  @Input() set image(val: string | null) {
    let src = val || Avatar_Default;
    // if (val) {
    //   let prefix = '';
    //   if (val.indexOf("/api") >= 0) {
    //     prefix = this._fileService.getAccessPointUrl();
    //   }
    //   else if (val.indexOf(Base64_Prefix) < 0) {
    //     prefix = Base64_Prefix;
    //   }
    //   src = `${prefix}${val}`;
    // }
    (this._el.nativeElement as HTMLImageElement).setAttribute('src', src);
  }

  @Input() height: number;
  @Input() width: number;

  constructor(private _el: ElementRef, private _fileService: FileService) {
    const supports = 'loading' in HTMLImageElement.prototype;
    if (supports) {
      this._el.nativeElement.setAttribute('loading', 'lazy');
    }
  }

  ngOnInit() {
    const height = this.height || +(this._el.nativeElement.getAttribute('height')) || Image_Size_Default;
    const width = this.width || +(this._el.nativeElement.getAttribute('width')) || Image_Size_Default;

    this._el.nativeElement.setAttribute('height', `${height}px`);
    this._el.nativeElement.setAttribute('width', `${width}px`);
  }

}
