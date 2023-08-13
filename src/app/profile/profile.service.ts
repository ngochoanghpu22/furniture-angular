import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {

    private profile$ = new BehaviorSubject<any>({});
    selectedProfile$ = this.profile$.asObservable();

    setProfile(profile: any) {
        this.profile$.next(profile);
    }

//   private _subject : BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);

//   get profile(): any | null {
//     return this._subject.getValue();
//   }

//   set profile(val: any | null){
//     this._subject.next(val);
//   }

//   profile$: Observable<any | null> = this._subject.asObservable();

  constructor() { }
}