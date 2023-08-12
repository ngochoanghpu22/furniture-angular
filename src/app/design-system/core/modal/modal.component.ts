import { AfterViewInit, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, EventEmitter, HostListener, OnDestroy, Output, Type, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ModalConfig } from './modal-config';
import { ModalRef } from './modal-ref';

const Modal_Width_Default = '95%';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'customClass'
  }
})
export class ModalComponent implements AfterViewInit, OnDestroy {

  @ViewChild('insertion', { read: ViewContainerRef }) insertionVcRef: ViewContainerRef | null = null;

  childComponentType: Type<any> | null = null;
  childComponentRef: ComponentRef<any> | null = null;

  public disableClose: boolean | undefined = true;
  public preventOverlayClick: boolean | undefined = false;
  public hideBtnClose: boolean | undefined = false;
  public overflowYInitial: boolean | undefined = false;
  public escToClose: boolean | undefined = false;
  public customClass: string = '';
  public width: string;
  public height: string;
  public maxHeight: string;

  private readonly _onClose: Subject<any> = new Subject<any>();

  public onClose: Observable<any> = this._onClose.asObservable();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private modalRef: ModalRef,
    private modalConfig: ModalConfig,
    private cd: ChangeDetectorRef) {
    if (this.modalConfig) {
      this.preventOverlayClick = this.modalConfig.preventOverlayClick == null ? false : this.modalConfig.preventOverlayClick;
      this.disableClose = this.modalConfig.disableClose == null ? true : this.modalConfig.disableClose;
      this.hideBtnClose = this.modalConfig.hideBtnClose;
      this.overflowYInitial = this.modalConfig.overflowYInitial;
      this.escToClose = this.modalConfig.escToClose;
      this.customClass = this.modalConfig.customClass || '';
      this.width = this.modalConfig.width || Modal_Width_Default;
      this.height = this.modalConfig.height || 'auto';
      this.maxHeight = this.modalConfig.maxHeight || '';
    }
  }

  ngAfterViewInit() {
    if (this.childComponentType) {
      this.loadChildComponent(this.childComponentType);
      this.cd.detectChanges();
    }
  }

  ngOnDestroy(): void {
    if (this.childComponentRef) {
      this.childComponentRef.destroy();
    }
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscape(event: KeyboardEvent) {
    if (this.escToClose) {
      this.close(event);
    }
  }

  loadChildComponent(componentType: Type<any>) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(componentType);
    if (this.insertionVcRef) {
      this.insertionVcRef.clear();
      this.childComponentRef = this.insertionVcRef.createComponent(factory);
    }
  }

  onOverlayClicked(evt: any) {
    if (this.preventOverlayClick) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    if (!this.disableClose) {
      this.modalRef.close();
    }
  }

  close($event: any): void {
    $event.preventDefault();
    $event.stopPropagation();
    this._onClose.next();
  }


}
