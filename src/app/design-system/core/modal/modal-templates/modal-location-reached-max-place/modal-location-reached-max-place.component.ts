import { Component, OnInit } from '@angular/core';
import { ModalRef } from '../../modal-ref';

@Component({
  selector: 'app-modal-location-reached-max-place',
  templateUrl: './modal-location-reached-max-place.component.html',
  styleUrls: ['./modal-location-reached-max-place.component.scss'],
})
export class ModalLocationReachedMaxPlaceComponent implements OnInit {
  constructor(private modalRef: ModalRef) {}

  ngOnInit() {}

  confirm() {
    this.modalRef.close(true);
  }
}
