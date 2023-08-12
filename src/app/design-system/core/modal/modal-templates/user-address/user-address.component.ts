import { Component, OnDestroy, OnInit, HostListener  } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AuthenticationService,
  ProfileService,
  UserMetadata,
} from '@flex-team/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModalConfig } from '../../modal-config';
import { ModalRef } from '../../modal-ref';

@Component({
  selector: 'app-user-address',
  templateUrl: './user-address.component.html',
  styleUrls: ['./user-address.component.scss'],
})
export class UserAddressComponent implements OnInit, OnDestroy {
  form: FormGroup;
  metadata: Partial<UserMetadata> = {};
  hasError = false;
  loading$ = new BehaviorSubject<boolean>(false);
  _subscription$ = new Subject();

  constructor(
    private fb: FormBuilder,
    private modalConfig: ModalConfig,
    private modalRef: ModalRef,
    private profileService: ProfileService,
    private authService: AuthenticationService
  ) {
    this.metadata = modalConfig.data;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this._subscription$.next();
    this._subscription$.complete();
  }

  initForm(): void {
    this.form = this.fb.group({
      address1: [this.metadata.address1],
      address2: [this.metadata.address2],
      address3: [this.metadata.address3],
      address4: [this.metadata.address4],
    });
  }

  submitForm() {
    var val = this.form.value as Partial<UserMetadata>;
    this.loading$.next(true);

    this.profileService
      .updateMetadata(val)
      .pipe(takeUntil(this._subscription$))
      .subscribe({
        next: (_resp) => {
          this.close(val);
          this.authService.updateMetadata(val);
        },
        complete: () => {
          this.loading$.next(false);
        },
      });
  }

  @HostListener('document:keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    if(this.form.valid) {
      this.submitForm()
    }
  }

  private close(data: Partial<UserMetadata>) {
    this.modalRef.close(data);
  }
}
