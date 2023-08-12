import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MessageService, ProfileService } from '@flex-team/core';
import imageCompression from 'browser-image-compression';
import { forkJoin, Observable, Observer } from 'rxjs';
import { ModalRef } from '../../modal-ref';


// an avatar should be 128 pixels x 128 pixels
const Compress_Image_Options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 128,
  useWebWorker: false,
  fileType: 'image/png'
}

@Component({
  selector: 'app-modal-upload-picture',
  templateUrl: './modal-upload-picture.component.html',
  styleUrls: ['./modal-upload-picture.component.scss']
})
export class ModalUploadPictureComponent implements OnInit, OnDestroy {

  @ViewChild('video') video: ElementRef | undefined;
  @ViewChild('canvasTiny') canvasTiny: ElementRef | undefined;
  @ViewChild('canvasSmall') canvasSmall: ElementRef | undefined;

  public WIDTH: number = 640;
  public HEIGHT: number = 480;
  public loading: boolean = false;

  public SMALL_WIDTH_TARGET: number = 320;
  public SMALL_HEIGHT_TARGET: number = 320;
  public TINY_WIDTH_TARGET: number = 160;
  public TINY_HEIGHT_TARGET: number = 160;

  permissionDenied = false;

  constructor(
    private modalRef: ModalRef,
    private profileService: ProfileService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.close();
  }

  init() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      this.loading = true;
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        this.loading = false;
        this.permissionDenied = false;
        if (this.video != null) {
          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.addEventListener('loadeddata', (event: any) => {
            this.computeVideoWidthHeight();
          });
          this.video.nativeElement.play();
        }
      }).catch(err => {
        this.loading = false;
        this.permissionDenied = true;
      });
    }

  }

  close() {
    if (this.video && this.video.nativeElement.srcObject) {
      var tracks = this.video.nativeElement.srcObject.getTracks();
      if (tracks.length > 0) {
        tracks[0].stop();
      }
    }
  }

  snap() {
    if (this.video != null && this.canvasSmall != null && this.canvasTiny != null) {
      this.drawImageToCanvas(this.video.nativeElement);
      this.close();

      const small$ = this.compress(this.canvasSmall.nativeElement, 'smallAvatar');
      const tiny$ = this.compress(this.canvasTiny.nativeElement, 'tinyAvatar');

      forkJoin([tiny$, small$]).subscribe(([tinySrc, smallSrc]) => {
        this.profileService.updateAvatar(tinySrc, smallSrc)
          .subscribe(
            resp => {
              if (resp.errorMessage === '') {
                this.loading = true;
                this.modalRef.close(resp.workload);
              } else {
                this.messageService.error('main.MAX_IMAGE_SIZE_ERROR');
              }
            });
      })

    }
  }

  drawImageToCanvas(image: any) {
    if (this.video != null && this.canvasTiny != null && this.canvasSmall != null) {
      var ratio = image.videoWidth / image.videoHeight;

      const canvasSmallWidth = this.canvasSmall.nativeElement.width
      const canvasSmallHeight = this.canvasSmall.nativeElement.height
      let sx = 0
      let sy = (image.videoHeight - image.videoWidth) / 2
      let dimension = image.videoWidth
      if (ratio > 1) {
        sx = (image.videoWidth - image.videoHeight) / 2
        sy = 0
        dimension = image.videoHeight
      }

      this.canvasSmall.nativeElement
        .getContext("2d")
        .drawImage(image, sx, sy, dimension, dimension, 0, 0, canvasSmallWidth, canvasSmallHeight);

      this.canvasTiny.nativeElement
        .getContext("2d")
        .drawImage(this.canvasSmall.nativeElement, 0, 0, this.canvasTiny.nativeElement.width, this.canvasTiny.nativeElement.width);

    }
  }

  computeVideoWidthHeight() {
    if (this.video != null) {
      var h = this.video.nativeElement.videoHeight;
      var w = this.video.nativeElement.videoWidth;
      var ratio = w / h;
      if (ratio > 1) {
        this.HEIGHT = 640 / ratio;
        this.SMALL_HEIGHT_TARGET = h / 2;
        this.SMALL_WIDTH_TARGET = h / 2;
        this.TINY_HEIGHT_TARGET = h / 4;
        this.TINY_WIDTH_TARGET = h / 4;

      }
      else {
        this.WIDTH = 480 * ratio;
        this.SMALL_HEIGHT_TARGET = w / 2;
        this.SMALL_WIDTH_TARGET = w / 2;
        this.TINY_HEIGHT_TARGET = w / 4;
        this.TINY_WIDTH_TARGET = w / 4;
      }
    }
  }

  private compress(canvas: HTMLCanvasElement, name: string): Observable<string> {
    return new Observable((observer: Observer<string>) => {
      try {
        imageCompression.canvasToFile(canvas, Compress_Image_Options.fileType, name, new Date().getTime()).then((imgFile: File) => {
          imageCompression(imgFile, Compress_Image_Options).then((compressedFile: File) => {
            imageCompression.getDataUrlFromFile(compressedFile).then((dataUrl: string) => {
              observer.next(dataUrl);
              observer.complete();
            })

          })
        }, (error: any) => {
          observer.error('Fail to compress image');
        })
      }
      catch (err: any) {
        observer.error(err);
      }
    })
  }
}
