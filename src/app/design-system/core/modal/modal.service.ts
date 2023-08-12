import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  ComponentFactoryResolver,
  ComponentRef,
  EmbeddedViewRef,
  Inject,
  Injectable, Injector,
  Renderer2,
  RendererFactory2,
  Type
} from '@angular/core';
import { ModalConfig } from './modal-config';
import { ModalInjector } from './modal-injector';
import { ModalRef } from './modal-ref';
import { ModalComponent } from './modal.component';

@Injectable()
export class ModalService {

  public renderer: Renderer2;

  private modals: ComponentRef<ModalComponent>[] = [];

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef, private injector: Injector,
    @Inject(DOCUMENT) private document: Document,
    private _rendererFactory: RendererFactory2) {
    this.renderer = this._rendererFactory.createRenderer(null, null);
  }

  /**
   * Sometime we want to open the component defined in application final.
   * Using componentType to do that
   * @param id 
   * @param componentType 
   */
  open(componentType: Type<any>, config: ModalConfig): ModalRef {
    const modalRef = this.appendModalComponentToBody(config);
    this.modals[this.modals.length - 1].instance.childComponentType = componentType;
    return modalRef;
  }


  private appendModalComponentToBody(config: ModalConfig): ModalRef {
    const mapTokens = new WeakMap();
    mapTokens.set(ModalConfig, config);

    const modalRef = new ModalRef();
    mapTokens.set(ModalRef, modalRef);

    const sub = modalRef.afterClosed$.subscribe(() => {
      this.removeModalComponentFromBody();
      sub.unsubscribe();
    });

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
    const componentRef = componentFactory.create(new ModalInjector(this.injector, mapTokens));

    this.appRef.attachView(componentRef.hostView);

    const dom = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(dom);

    this.addClassToBody('modal-open');

    this.modals.push(componentRef);

    this.modals[this.modals.length - 1].instance.onClose.subscribe(() => {
      modalRef.close();
    });

    return modalRef;

  }

  private removeModalComponentFromBody() {
    const componentRef = this.modals[this.modals.length - 1];
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
    this.modals.pop();
    if (!this.modals.length) {
      this.removeClassToBody('modal-open');
    }
  }

  private addClassToBody(classBody: string) {
    this.renderer.addClass(this.document.body, classBody);
  }

  private removeClassToBody(classBody: string) {
    this.renderer.removeClass(this.document.body, classBody);
  }

}
