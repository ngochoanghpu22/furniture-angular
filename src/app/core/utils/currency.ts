export function ConvertToVND(value: any) {
    if (value) {
        const price = value.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});

        return price;
    }
}