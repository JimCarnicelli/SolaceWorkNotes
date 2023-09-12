import { ApiResult } from '@/lib/apiServer';

export namespace apiClient {

    /** Wrapper for fetch() with app-centric goodies */
    export async function fetch<Params, Return>(path: string, inputs?: Params): Promise<Return> {
        try {
            const res = await window.fetch('/' + path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: inputs ? JSON.stringify(inputs) : undefined,
            });
            const ret = await res.json() as ApiResult<Return>;

            if (ret.errorCode === 'Login') {
                window.open('/user/log-in', '_self');
                throw new Error('403 - Access denied');
            }

            if (res.status === 403) throw new Error('403 - Access denied');
            if (res.status === 404) throw new Error('404 - API route not found');
            if (res.status === 500) throw new Error('500 - Runtime error: ' + ret.error);
            return ret.data as Return;

        } catch (err: any) {
            console.error('apiClient.fetch() error: ', err);
            throw new Error(err.message ?? err.toString());
        }
    }

    /** Translate the ISO 8601 formatted string into a Date value */
    export function fromUtcIso(value: any, columnName?: string): any {
        if (!value) return value;
        if (columnName && Array.isArray(value)) {  // Rowset
            value.forEach((row: Record<string, any>) => {
                row[columnName] = fromUtcIso(row[columnName]);
            });
        } else if (columnName) {  // Single row
            value[columnName] = fromUtcIso(value[columnName]);
        } else if (typeof (value) === 'string') {  // Assume it's a string already
            return new Date(value);
        } else {
            throw new Error('Unexpected input to api.fromUtcIso()');
        }
    }

}
