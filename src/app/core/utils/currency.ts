export function ConvertToVND(value: any) {
    if (value || 0) {
        const price = value.toLocaleString('it-IT', {style : 'currency', currency : 'VND'});

        return price;
    }

    return "0 VND";
}