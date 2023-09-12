export type Guid = string;
export const emptyGuid = '00000000-0000-0000-0000-000000000000';

export type DbRow = { [colName: string]: any };
export type DbSet = { [name: string]: DbRow[] };

export type PagedRowset<T> = {
    rows: T[],
    count?: number,
}

export function emptyPagedRowset<T>(): PagedRowset<T> {
    return { rows: [], count: 0 };
}
