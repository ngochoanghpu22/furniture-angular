import { Injectable } from '@angular/core';
import { QuickPlayDataProvider } from '@design-system/core';
import { Observable } from 'rxjs';
import { SelectionService } from './selection.service';

@Injectable()
export class QuickPlayDataService  {

  constructor(private selectionService: SelectionService) {
  }

  getFavoritesSelection(): Observable<any[]> {
    return this.selectionService.getFavoritesSelection();
  }

  getDefaultGroupsSelection(): Observable<any[]> {
    return this.selectionService.getDefaultGroupsSelection();
  }

}
