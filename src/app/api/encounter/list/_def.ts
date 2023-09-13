import { apiClient } from '@/lib/utilities/apiClient';
import { Guid, PagedRowset } from '@/lib/db/dbShared';
import { EncounterRow } from '@/lib/db/entities/EncounterTable';

export namespace apiEncounterList {

    export type Params = {
        skip?: number,
        take?: number,
        filterText?: string,
        advocateId?: Guid,
        clientId?: Guid,
    }

    export type Return = {
        list?: PagedRowset<EncounterRow>,
    }

    const url = 'api/encounter/list';
    export const call = async (params?: Params) => await apiClient.fetch<Params, Return>(url, params);
}
