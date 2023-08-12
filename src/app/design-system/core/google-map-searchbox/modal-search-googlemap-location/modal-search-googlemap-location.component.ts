import { Component, OnInit } from '@angular/core';
import { ModalConfig, ModalRef } from '../../modal';

@Component({
  selector: 'fxt-modal-search-googlemap-location',
  templateUrl: './modal-search-googlemap-location.component.html',
  styleUrls: ['./modal-search-googlemap-location.component.scss']
})
export class ModalSearchGooglemapLocationComponent implements OnInit {

  currentPosition : google.maps.LatLngLiteral;

  constructor(private modalRef: ModalRef, protected config: ModalConfig) {
  }

  ngOnInit() {
    this.currentPosition = this.config.data;
  }

  onLocationSelected(event: any) {
    this.modalRef.close(event);
  }

}
