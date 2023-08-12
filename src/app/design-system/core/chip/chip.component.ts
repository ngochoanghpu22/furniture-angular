import {
  ChangeDetectionStrategy, Component,
  EventEmitter, HostBinding, Input, OnInit, Output
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FileService, SelectionGroups, SelectionType } from '@flex-team/core';

const Base64_Prefix = 'data:image/png;base64,';


@Component({
  selector: 'fxt-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipComponent implements OnInit {

  _id: string = "";
  _text: string = "";
  _icon: string = "";

  isCore = false;
  isSocial = false;
  isWork = false;
  isOrg = false;
  isAllCompany = false;

  isIndividual = false;

  @Input() set item(val: any) {
    if (val) {
      this._text = val.name || val.fullName || val.email;

      if (!this._text) {
        const email = (val.emails != null && val.emails.length > 0) ? val.emails[0] : val.email;
        this._text = email;
      }

      this._id = val.id;

      this.isAllCompany = val.group == SelectionGroups.AllCompany;

      if (val.type == SelectionType.Team) {
        if (val.isHierarchy) {
          this.isCore = true;
          this._icon = 'fa-network-wired';
        }
        else if (val.isSocial) {
          this.isSocial = true;
          this._icon = 'fa-user-friends';
        }
        else {
          this.isWork = true;
          this._icon = 'fa-hammer-war';
        }
      } else {
        this.isIndividual = true;
        this._icon = null;
      }
    }
  }

  _item: any;

  @Input() set selected(val: boolean | string) {
    this._selected = (val === '') ? true : val as boolean;
  }
  @HostBinding('class.selected') _selected: boolean = false;

  @Input() set image(val: string | null) {
    if (val) {
      let prefix = '';
      if (val.indexOf("/api") >= 0) {
        prefix = this._fileService.getAccessPointUrl();
      }
      else if (val.indexOf(Base64_Prefix) < 0) {
        prefix = Base64_Prefix;
      }
      this._imageUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(`${prefix}${val}`);
    }
  }
  _imageUrl: SafeUrl | null = '';

  @Input() removable: boolean = false;
  @Input() hideIcon: boolean = false;

  @Output() onCrossClick: EventEmitter<string> = new EventEmitter();

  public SelectionTypeEnum = SelectionType;

  constructor(private domSanitizer: DomSanitizer, private _fileService: FileService) { }

  ngOnInit(): void {
  }
}
