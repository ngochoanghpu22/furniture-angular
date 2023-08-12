import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'fxt-file-preview-input',
  templateUrl: './file-preview-input.component.html',
  styleUrls: ['./file-preview-input.component.scss']
})
export class FilePreviewInputComponent implements OnInit, OnChanges {

  imgURL: any;
  selectedFile: File;

  @Input() buttonText = 'Add photo';
  @Input() selected: string | null;
  @Input() canEdit = true;

  @Output() fileChanged = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.imgURL = this.selected;
  }

  preview(files: any) {
    if (files.length === 0)
      return;

    var mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    var reader = new FileReader();
    this.selectedFile = files[0];
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
      this.fileChanged.emit(this.imgURL);
    }
  }

}
