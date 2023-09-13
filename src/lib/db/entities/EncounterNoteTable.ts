import { DbTable } from '@/lib/db/dbServer';
import { Guid } from '@/lib/db/dbShared';
import { EncounterStatus } from './EncounterTable';

export enum EncounterNoteType {
    unspecified = 0,
    directMessage = 1,
    caseNote = 2,
}

export const encounterNoteTypeTitles = [
    'Unspecified',
    'Direct message',
    'Case note',
];

/** One database table definition */

export type EncounterNoteRow = {
    id?: Guid,
    encounter_id?: Guid,
    type?: EncounterNoteType,
    message?: string,
    submitted_by_id?: Guid,
    submitted_at?: Date,
    read_at?: Date,
    created_at?: Date,
    updated_at?: Date,
    deleted?: boolean,

    // Derived columns
    submitted_by_name?: string,
    encounter_client_id?: Guid,
    encounter_client_name?: string,
    encounter_status?: EncounterStatus,
    encounter_initiated_by_advocate?: boolean,
    encounter_summary?: string,
    encounter_started_at?: Date,
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
