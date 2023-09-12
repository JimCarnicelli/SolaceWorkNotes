import { apiClient } from '@/lib/utilities/apiClient';
import { Guid, PagedRowset } from '@/lib/db/dbShared';
import { UserRow } from '@/lib/db/entities/UserTable';

export namespace apiUserList {

    export type Params = {
        skip?: number,
        take?: number,
        filterText?: string,
        advocateId?: Guid,
    }

    export type Return = {
        users?: PagedRowset<UserRow>,
    }

    const url = 'api/user/list';
    export const call = async (params?: Params) => await apiClient.fetch<Params, Return>(url, params);
}
