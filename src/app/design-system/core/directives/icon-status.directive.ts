import { Directive, ElementRef, Input, OnChanges, OnInit, Renderer2, SimpleChanges } from '@angular/core';
import { HierarchyLevel } from '@flex-team/core';

const Home_Fixed_Order = 0;
const Office_Fixed_Order = 1;


@Directive({
  selector: '[fxtIconStatus]',
  host: {
    'class': 'fxt-icon-status'
  }
})
export class IconStatusDirective implements OnInit, OnChanges {

  @Input('fxtIconStatus') item: {
    hierarchyLevel: HierarchyLevel,
    orderInList: number,
    color: string
  };

  constructor(private renderer: Renderer2, private hostElement: ElementRef) { }

  ngOnInit() {

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.item.hierarchyLevel != null) {
      this.renderer.addClass(this.hostElement.nativeElement, `level-${this.item.hierarchyLevel}`);
    }
    this.renderer.setStyle(this.hostElement.nativeElement, 'color', this.item.color);
  }

}
