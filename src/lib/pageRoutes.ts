import { Guid } from "./db/dbShared";

export namespace pageRoutes {

    export const home = () => '/';

    export const clientList = () => `/client`;
    export const clientView = (id: Guid) => `/client/${id}`;

}

type s = string;

/** Returns the same URL with any optional parameters URL-encoded into the query string */
export function toUrl<T>(url: string, params: T | undefined) {
    if (!params) return url;
    const query = Object.keys(params).map(key =>
        encodeURIComponent(key) + '=' + encodeURIComponent((params as any)[key] + '')
    ).join('&');
    return url + ((query && query !== '') ? '?' + query : '');
}
