import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FxtAnimations, ModalService, ModalUploadPictureComponent } from '@design-system/core';
import { AuthenticationService, MessageService, ProfileService, User } from '@flex-team/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const Compress_Image_Options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 128,
  useWebWorker: false,
  fileType: 'image/png'
}

@Component({
  selector: 'app-profil',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [
    FxtAnimations.rotate
  ]
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('canvasTiny') canvasTiny: ElementRef | undefined;
  @ViewChild('canvasSmall') canvasSmall: ElementRef | undefined;

  activeTab = 1;
  currentUser: User;

  private _destroyed = new Subject<void>();
  halfDayEnabled = false;

  constructor(
    private modalService: ModalService,
    private authService: AuthenticationService,
    private profileService: ProfileService,
    private messageService: MessageService) {
    this.halfDayEnabled = this.authService.IsHalfDaysEnabled;
  }

  ngOnInit(): void {
    this.authService.currentUser$.pipe(takeUntil(this._destroyed)).subscribe(data => {
      this.currentUser = data;
    });
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  openTakePicture() {
    const modalRef = this.modalService.open(ModalUploadPictureComponent, { width: 'auto' });
    modalRef.afterClosed$.subscribe(resp => {
      if (resp) {
        const now = new Date();
        this.currentUser.tinyPicture = `${resp}?${now.getTime()}`;
        this.authService.currentUser = { ...this.currentUser }
        this.messageService.success();
      }
    })
  }

  handleInputChange(e: any) {
    var file = e.target.files[0];
    var pattern = /image-*/;
    var reader = new FileReader();
    if (!file.type.match(pattern)) {
      alert('invalid format');
      return;
    }
    reader.onload = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }

  _handleReaderLoaded(e: any) {
    let reader = e.target;
    let imageSrc = reader.result;
    imageSrc = imageSrc.replace('jpeg', 'png');

    this.profileService.updateAvatar(imageSrc, imageSrc)
      .subscribe(r => {
        if (r.errorMessage === '') {
          const now = new Date();
          this.currentUser.tinyPicture = `${this.currentUser.tinyPicture}?${now.getTime()}`;
          this.authService.currentUser = { ...this.currentUser }
          this.messageService.success('notifications.your_changes_updated');
          return;
        }
        this.messageService.error('main.MAX_IMAGE_SIZE_ERROR');
      }, _ => {
        this.messageService.error('notifications.an_error_occurred');
      });
  }
}
