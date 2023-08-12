import { Component, OnInit } from '@angular/core';
import { LOAD25_IMG, LOAD50_IMG, LOAD75_IMG, OFFICE_ICON_IMG } from '../../../constants';


@Component({
  selector: 'app-modal-toggle-question',
  templateUrl: './modal-toggle-question.component.html',
  styleUrls: ['./modal-toggle-question.component.scss'],
})
export class ModalToggleQuestionComponent implements OnInit {
  public load25 = LOAD25_IMG;
  public load50 = LOAD50_IMG;
  public load75 = LOAD75_IMG;
  public officeIcon = OFFICE_ICON_IMG;

  constructor() { }

  ngOnInit() { }
}
