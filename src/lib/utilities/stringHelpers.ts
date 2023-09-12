
/** Clean way to pack in an optional CSS class name on an optional condition */
export function cn(text: string | undefined | null, ifExpr?: any, textIfFalse?: string) {
    if (!text) return '';
    if (arguments.length > 1 && !ifExpr) return (textIfFalse ? ' ' + textIfFalse : '');
    return ' ' + text;
}

export function stringCompare(a: string | undefined, b: string | undefined) {
    a = (a ?? '').toLowerCase();
    b = (b ?? '').toLowerCase();
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
}
