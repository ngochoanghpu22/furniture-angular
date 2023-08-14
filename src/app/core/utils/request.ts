import { HttpParams } from '@angular/common/http';

export const createRequestOption = (req?: any): HttpParams => {
    let options: HttpParams = new HttpParams();
    if (req) {
        Object.keys(req).forEach(key => {
            if (key !== 'sort') {
                if(req[key] instanceof Array){
                    const arr : Array<any> =  req[key];
                    arr.forEach(
                        val => options = options.append(key, val)
                    )
                }else{
                    options = options.append(key, req[key]);
                }
            }
        });
        if (req.sort) {
            req.sort.forEach((val: string) => {
                options = options.append('sort', val);
            });
        }
    }
    return options;
};
