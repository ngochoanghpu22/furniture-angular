import { SelectionItem } from "./SelectionItem";

export interface SelectionPayload {
  isAllCompany: boolean;
  isFavorites: boolean;
  items: SelectionItem[];
}
