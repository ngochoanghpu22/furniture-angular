import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/core/services/user-service/user.service';

declare var $: any;


@Component({
  selector: 'fxt-finish-task',
  templateUrl: './finish-task.component.html',
  styleUrls: ['./finish-task.component.scss']
})
export class FinishTaskComponent implements OnInit {

  verifyTokenForm: FormGroup;
  loading = false;

  constructor(private formBuilder: FormBuilder,
              private userService: UserService,
              private toastr: ToastrService) { }

  ngOnInit(): void {
    this.verifyTokenForm = this.formBuilder.group({
      token: [null, [Validators.required]]
    });
  }

  finishTask() {
    const params = {
      token: this.verifyTokenForm.controls.token.value
    };

    this.userService
      .finishTask(params)
      .subscribe(
        (data: any) => {
          this.loading = false;
          if (!data.isSuccessed) {
            this.toastr.error(data.message);
          }
          else {
            // close dialog
            $(".btn-modal-close").click();
            this.toastr.success("You are done task.");
          }
        },
        (error: { message: string; }) => {
          this.loading = false;
          this.toastr.error(error.message);
        }
      );
  }

  get f() {
    return this.verifyTokenForm.controls;
  }

}
