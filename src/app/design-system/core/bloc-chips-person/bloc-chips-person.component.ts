import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SelectionItem, SelectionPayload } from '@flex-team/core';

@Component({
  selector: 'fxt-bloc-chips-person',
  templateUrl: './bloc-chips-person.component.html',
  styleUrls: ['./bloc-chips-person.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlocChipsPersonComponent implements OnInit {

  @Input() currentSelection: SelectionPayload;

  @Input() title: string = '';
  @Input() descriptionHtml: string = '';
  @Input() hideSearch = false;
  @Input() hideTitle = false;
  @Input() hideIconSearch = false;

  @Output() search: EventEmitter<any> = new EventEmitter<any>();
  @Output() chipClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() questionClicked: EventEmitter<any> = new EventEmitter<any>();


  constructor() { }

  ngOnInit() {
  }

  onQuestionClicked($event: Event) {
    this.questionClicked.emit();
    $event.preventDefault();
    $event.stopPropagation();
  }

  onChipClicked($event: Event, selection: SelectionItem) {
    this.chipClicked.emit(selection);
    $event.preventDefault();
    $event.stopPropagation();
  }

}
