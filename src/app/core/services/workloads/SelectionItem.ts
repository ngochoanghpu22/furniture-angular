import { SelectionType } from "./enums";
import { SelectionGroups } from "./SelectionGroups";
import { Team } from "./Team";

export const Guid_Empty = '00000000-0000-0000-0000-000000000000';

export class SelectionItem {

  public type: SelectionType;
  public id: string = "";
  public name: string = "";
  public teamName: string = "";
  public image: string = "";
  public emails: string[] = [];
  public selected?: boolean = false;

  public isPrefered?: boolean = false;
  public isHierarchy?: boolean = false;
  public isSocial?: boolean = false;
  public removable?: boolean = false;
  public group?: SelectionGroups = null;
  public isExternalEmail: boolean = false;

  constructor(team?: Team) {
    if (team) {
      this.type = SelectionType.Team;
      this.name = team.name;
      this.isPrefered = team.isPrefered;
      this.isHierarchy = team.isHierarchy;
      this.isSocial = team.isSocial;
    }
  }

  get isAllCompanyOrFavorites(): boolean {
    return this.group == SelectionGroups.AllCompany || this.group == SelectionGroups.Favorites;
  }

  get isFavoritesGroups(): boolean {
    return this.group == SelectionGroups.FavoritesGroups;
  }

  static factoryAllCompanySelectionItem(companyName: string): SelectionItem {
    const item = new SelectionItem();
    item.id = Guid_Empty;
    item.name = 'All Company';
    item.teamName = companyName;
    item.type = SelectionType.Team;
    item.group = SelectionGroups.AllCompany;
    item.selected = true;
    item.removable = true;
    return item;
  }

  static factoryFavoritesSelectionItem(): SelectionItem {
    const item = new SelectionItem();
    item.id = Guid_Empty;
    item.name = 'My favorites';
    item.teamName = 'Colleague list';
    item.type = SelectionType.Team;
    item.group = SelectionGroups.Favorites;
    item.selected = true;
    item.removable = true;
    return item;
  }
}