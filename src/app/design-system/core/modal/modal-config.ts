export class ModalConfig<D = any> {
    data?: D | null = null;
    width?: string;
    height?: string;
    maxHeight?: string;
    hideBtnClose?: boolean;
    overflowYInitial?: boolean;
    escToClose?: boolean;
    disableClose?: boolean;
    preventOverlayClick?: boolean;
    customClass?: string = '';
}