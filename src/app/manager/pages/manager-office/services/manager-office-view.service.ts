import { Injectable } from '@angular/core';
import { Building, Floor, Seat } from '@flex-team/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ManagerOfficeViewService {

  private _buildingSubject: BehaviorSubject<Building> = new BehaviorSubject<Building>(null);
  building$: Observable<Building> = this._buildingSubject.asObservable();

  private _floorSubject: BehaviorSubject<Floor> = new BehaviorSubject<Floor>(null);
  floor$: Observable<Floor> = this._floorSubject.asObservable();

  private _hoveredSeatsSubject: BehaviorSubject<Seat[]> = new BehaviorSubject<Seat[]>([]);
  hoveredSeats$: Observable<Seat[]> = this._hoveredSeatsSubject.asObservable();

  private _clickedSeatsSubject: BehaviorSubject<Seat[]> = new BehaviorSubject<Seat[]>([]);
  clickedSeats$: Observable<Seat[]> = this._clickedSeatsSubject.asObservable();

  set building(val: Building) {
    this._buildingSubject.next(val);
  }

  get building(): Building {
    return this._buildingSubject.getValue();
  }

  set floor(val: Floor) {
    this._floorSubject.next(val);
  }

  get floor(): Floor {
    return this._floorSubject.getValue();
  }

  set clickedSeats(val: Seat[]) {
    this._clickedSeatsSubject.next(val);
  }

  get clickedSeats(): Seat[] {
    return this._clickedSeatsSubject.getValue();
  }

  set hoveredSeats(val: Seat[]) {
    this._hoveredSeatsSubject.next(val);
  }

  get hoveredSeats(): Seat[] {
    return this._hoveredSeatsSubject.getValue();
  }

  needReload = false;

  constructor() { }

  public reset() {
    this.building = null;
    this.floor = null;
    this.hoveredSeats = [];
    this.clickedSeats = [];
  }

}
