import { DbTable } from '@/lib/db/dbServer';
import { Guid } from '@/lib/db/dbShared';

export enum EncounterNoteType {
    directMessage = 1,
    caseNote = 2,
}

/** One database table definition */

export type EncounterNoteRow = {
    id?: Guid,
    encounter_id?: Guid,
    type?: EncounterNoteType,
    message?: string,
    submitted_at?: Date,
    advocate_read_at?: Date,
    client_read_at?: Date,
    created_at?: Date,
    updated_at?: Date,
    deleted?: boolean,
}

/** Each encounter will typically have one or more direct messages or other notes attached */
export const EncounterNoteTable: DbTable<EncounterNoteRow> = {
    table: 'encounter_note',
    sortOrder: ['submitted_at', 'created_at'],
    deletedFlag: true,
    populateOnInsert: {
        id: 'uuid',
        submitted_at: 'now',
        created_at: 'now',
        updated_at: 'now',
    },
    populateOnUpdate: {
        updated_at: 'now',
    },
}
