import { Observable, Subject } from "rxjs";

export class ModalRef {

    constructor() {}

    private readonly _afterClosed: Subject<any> = new Subject<any>();
    afterClosed$: Observable<any> = this._afterClosed.asObservable();

    close(result?: any) {
        this._afterClosed.next(result);
    }
}
