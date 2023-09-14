import { apiClient } from '@/lib/utilities/apiClient';
import { EncounterNoteRow } from '@/lib/db/entities/EncounterNoteTable';

export namespace apiEncounterNoteSave {

    export type Params = {
        item: EncounterNoteRow,
    }

    export type Return = {
        item: EncounterNoteRow,
    }

    const url = 'api/encounter/note/save';
    export const call = async (params?: Params) => await apiClient.fetch<Params, Return>(url, params);
}
