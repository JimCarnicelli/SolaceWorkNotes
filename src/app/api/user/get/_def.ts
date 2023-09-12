import { apiClient } from '@/lib/apiClient';
import { Guid } from '@/lib/db/dbShared';
import { UserRow } from '@/lib/db/entities/UserTable';

export namespace apiUserGet {

    export type Params = {
        id: Guid,
    }

    export type Return = {
        user?: UserRow,
    }

    const url = 'api/user/get';
    export const call = async (params?: Params) => await apiClient.fetch<Params, Return>(url, params);
}
