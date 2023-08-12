import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { HierarchyLevel, IMetadataValue, MetadataTypes } from '@flex-team/core';
import _ from 'underscore';

type LocationStatusType = {
  id: string; // Combination of locationId + seatId
  hierarchyLevel: HierarchyLevel,
  orderInList: number,
  color: string,
  isConfirmed: boolean,
  name: string,
  address: string,
  metadataValues: IMetadataValue[],
  info: string
}

@Component({
  selector: 'fxt-location-status',
  templateUrl: './location-status.component.html',
  styleUrls: ['./location-status.component.scss'],
  host: {
    '[class.mode-half-day]': 'modeHalfDay'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationStatusComponent implements OnInit {

  modeHalfDay = false;
  hasMetadata = false;

  @Input() set item(val: any | any[]) {
    let items = null;
    if (!Array.isArray(val)) {

      let clone = null;
      if (val != null) {
        clone = Object.assign({}, val, {
          name: val.selectedRemoteLocation || val.name,
        })

        if (val.metadataValues?.length > 0) {
          clone.info = this.factoryInfo(val.metadataValues);
        }
      }

      items = [clone];

    } else {
      val = val.map(x => {
        let clone = null;
        if (x != null) {
          clone = Object.assign({}, x, {
            name: x.selectedRemoteLocation || x.name,
            id: `${x.selectedRemoteLocationId}_${x.selectedRemoteSeatId}`
          })

          if (x.metadataValues?.length > 0) {
            clone.info = this.factoryInfo(x.metadataValues);
          }
        }

        return clone;
      });

      items = val;
    }

    this._items = this.markup(items);
    this.modeHalfDay = this._items.length >= 2;

  }

  @Input() selected: boolean;
  @Input() disableUnconfirmed: boolean;
  @Input() disabled: boolean;
  @Input() canViewAllInfos: boolean;

  public _items: LocationStatusType[] = [];

  constructor() { }

  ngOnInit() {
  }

  private factoryInfo(metadataValues: IMetadataValue[]): string {

    if (!this.canViewAllInfos) {
      metadataValues = metadataValues.filter(x => x.metadataItem.showAnswerToEveryone);
    }

    const array = metadataValues.map(x => {
      let value = x.method;
      if (x.metadataItem.type == MetadataTypes.Geodata) {
        try {
          value = JSON.parse(x.method).location;
        } catch {
          //ignore
        }
      }
      return `${x.metadataItem.name}: ${value}`;
    })

    return array.join('\n');
  }

  /**
   * Check if same location for halfdays
   * @param items 
   */
  private markup(items: LocationStatusType[]): LocationStatusType[] {
    if (items.length <= 1) return items;
    return _.uniq(items, x => {
      return x?.id;
    })
  }

}
