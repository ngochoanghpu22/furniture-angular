import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalConfig, ModalRef } from '@design-system/core';
import {
	CapacityGreaterThanAllowedLoadValidator,
	ManagerOfficeService, MessageService
} from '@flex-team/core';
import { Observable } from 'rxjs';

@Component({
	selector: 'manager-office-modal-base',
	template: '',
})
export abstract class ManagerOfficeModalBaseComponent implements OnInit {

	form: FormGroup;
	data: any;

	constructor(
		protected modalRef: ModalRef, protected fb: FormBuilder,
		protected managerOfficeService: ManagerOfficeService, 
		protected config: ModalConfig,
		protected messageService: MessageService
	) {
		this.data = config.data;
	}

	ngOnInit() {

		this.form = this.fb.group({
			id: [null],
			name: [null, Validators.required],
			capacity: [0],
			allowedLoad: [0]
		}, {
			validator: CapacityGreaterThanAllowedLoadValidator()
		});

		this.initFormGroup();
		this.form.patchValue(this.data);
	}

	cancel() {
		this.modalRef.close();
	}

	ok() {
		if (this.form.valid) {
			this.save(this.form.value).subscribe((data) => {
				data.workload.capacity = data.workload.capacity || 0;
				data.workload.allowedLoad = data.workload.allowedLoad || 0;
				this.modalRef.close(data.workload);
				this.messageService.success();
			}, err => {
				console.error('Fail to save', err);
			})
		}
	}


	abstract initFormGroup(): void;
	abstract save(dto: any): Observable<any>;


}
