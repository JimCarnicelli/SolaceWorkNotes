import { apiClient } from '@/lib/utilities/apiClient';
import { Guid } from '@/lib/db/dbShared';
import { UserRow } from '@/lib/db/entities/UserTable';

export namespace apiUserGet {

    export type Params = {
        id: Guid,
    }

    export type Return = {
        item?: UserRow,
    }

    const url = 'api/user/get';
    export const call = async (params?: Params) => await apiClient.fetch<Params, Return>(url, params);
}
