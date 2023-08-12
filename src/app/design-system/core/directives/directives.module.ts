import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ClickOutsideDirective } from './click-outside.directive';
import { ImageBase64Directive } from './image-base64.directive';
import { IconStatusDirective } from './icon-status.directive';
import { ImageLinkApiDirective } from './image-link-api.directive';

const directives = [
  ClickOutsideDirective,
  ImageBase64Directive,
  ImageLinkApiDirective,
  IconStatusDirective
]

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    ...directives
  ],
  exports: [...directives]
})
export class DirectivesModule { }
