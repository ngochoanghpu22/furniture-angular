import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'fxt-geodata-preview',
  templateUrl: './geodata-preview.component.html',
  styleUrls: ['./geodata-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeodataPreviewComponent implements OnInit, OnChanges {

  @Input() geodata: string;
  @Input() showLatLng = false;

  @Output() buttonAddClicked = new EventEmitter<void>();

  geodataObj: { lat: number, lng: number, location: string, formattedAddress?: string };

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.geodata && this.geodata) {
      try {
        this.geodataObj = JSON.parse(this.geodata);
      } catch {
        this.geodataObj = null;
      }
    }
  }

  onAddClicked($event: any) {
    $event.preventDefault();
    $event.stopPropagation();
    this.buttonAddClicked.emit();
  }

}
