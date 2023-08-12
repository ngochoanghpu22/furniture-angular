import { DateTime } from "luxon";
import { Floor } from "./Floor";
import { MetadataTemplate } from "./MetadataTemplate";
import { SelectionItem } from "./SelectionItem";

export class ManagerFilter {

    start: DateTime;
    end: DateTime;

    selection: SelectionItem[];

    constructor(_start?: DateTime, _end?: DateTime, selection?: SelectionItem[]) {
        this.start = _start || DateTime.now();
        this.end = _end || DateTime.now();
        this.selection = selection || [];
    }

    get periodText(): string {
        const isSameMonth = this.start.month === this.end.month;
        if (isSameMonth) {
            return `${this.start.day} - ${this.end.day} ${this.start.monthLong}`
        } else {
            const startText = this.getDateMonthStr(this.start);
            const endText = this.getDateMonthStr(this.end);
            return `${startText} - ${endText}`;
        }
    }


    // Get date-month: 16 June for example
    private getDateMonthStr(date: DateTime): string {
        return `${date.day} ${date.monthLong}`;
    }

}

export interface ManagerSort {
    name: string;
    dayIndex: number;
}

export interface ManagerMapContext{
    date: Date;
    selectedFloor: Partial<Floor>;
    floors: Partial<Floor>[];
    metadataTemplate: MetadataTemplate
}