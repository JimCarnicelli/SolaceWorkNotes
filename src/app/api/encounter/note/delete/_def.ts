import { apiClient } from '@/lib/utilities/apiClient';
import { Guid } from '@/lib/db/dbShared';

export namespace apiEncounterNoteDelete {

    export type Params = {
        id: Guid,
    }

    export type Return = {
    }

    const url = 'api/encounter/note/delete';
    export const call = async (params?: Params) => await apiClient.fetch<Params, Return>(url, params);
}
