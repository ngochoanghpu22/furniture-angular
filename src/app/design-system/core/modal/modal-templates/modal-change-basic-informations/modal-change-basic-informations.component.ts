import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService, ProfileService, SamePasswordValidator } from '@flex-team/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ModalConfig } from '../../modal-config';
import { ModalRef } from '../../modal-ref';

@Component({
  selector: 'fxt-modal-change-basic-informations',
  templateUrl: './modal-change-basic-informations.component.html',
  styleUrls: ['./modal-change-basic-informations.component.scss']
})
export class ModalChangeBasicInformationsComponent implements OnInit, OnDestroy {

  ownerFullName: string = '';
  form: FormGroup = new FormGroup({});

  data: any;
  loading = false;
  hasError = false;

  private _destroyed: Subject<void> = new Subject<void>();

  constructor(private formBuilder: FormBuilder, private modalConfig: ModalConfig,
    private authService: AuthenticationService,
    private modalRef: ModalRef,
    private profileService: ProfileService) {
    this.data = this.modalConfig.data;
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      lastName: [this.data.lastName, Validators.required],
      firstName: [this.data.firstName, Validators.required],
      fullName: [{
        value: this.data.fullName,
        disabled: true
      }, Validators.required],
      password: [null],
      confirmPassword: [null]
    },
      <AbstractControlOptions>{
        validator: [
          SamePasswordValidator()
        ]
      });

    this.form.valueChanges.pipe(takeUntil(this._destroyed)).subscribe(vals => {
      this.updateFullName();
    })
  }

  /**
   * Update fullname
   */
  private updateFullName() {
    this.form.patchValue({
      fullName: `${this.form.get('firstName').value} ${this.form.get('lastName').value}`
    }, {
      onlySelf: true,
      emitEvent: false
    })
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  confirm() {
    if (this.form.valid) {
      const dto = this.form.getRawValue();
      this.loading = true;
      this.profileService.updateProfile(dto).pipe(finalize(() => this.loading = false))
        .subscribe(resp => {
          this.hasError = false;
          this.authService.updateUser(dto);
          this.close(dto);
        }, _ => {
          this.hasError = true;
        });
    }
  }

  private close(res?: any) {
    this.modalRef.close(res);
  }
}
