import { apiClient } from '@/lib/utilities/apiClient';
import { Guid, PagedRowset } from '@/lib/db/dbShared';
import { EncounterNoteRow } from '@/lib/db/entities/EncounterNoteTable';

export namespace apiEncounterNoteList {

    export type Params = {
        skip?: number,
        take?: number,
        filterText?: string,
        encounterId?: Guid,
        advocateId?: Guid,
        clientId?: Guid,
    }

    export type Return = {
        list?: PagedRowset<EncounterNoteRow>,
    }

    const url = 'api/encounter/note/list';
    export const call = async (params?: Params) => await apiClient.fetch<Params, Return>(url, params);
}
