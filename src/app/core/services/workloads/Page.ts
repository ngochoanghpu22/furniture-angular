export class Page {
    pageSize: number = 10;
    totalCount: number = 0;
    totalPages: number = 0;
    pageNumber: number = 1;
    hasPrevious: boolean;
    hasNext: boolean;

    sortOrder?: string;
    sortProp?: string;
    keyword?:string = "";

    constructor(options?: any) {
        if (options) {
            this.totalCount = options.totalCount;
            this.pageSize = options.pageSize;
            this.pageNumber = options.pageNumber;
            this.totalPages = options.totalPages;

            this.sortOrder = options.sortOrder;
            this.sortProp = options.sortProp;

            this.keyword = options.keyword || "";

            this.hasPrevious = this.pageNumber > 1;
            this.hasNext = this.pageNumber < this.totalPages;

        }
    }
}

export class PagedData<T> {
    page: Page;
    data: Array<T> = new Array<T>();
    body: any;
}

