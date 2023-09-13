import { DbTable } from '@/lib/db/dbServer';
import { Guid } from '@/lib/db/dbShared';

/** One database table definition */

export type EncounterRow = {
    id?: Guid,
    advocate_id?: Guid,
    client_id?: Guid,
    summary?: string,
    initiated_by_advocate?: boolean,
    started_at?: Date,
    created_at?: Date,
    updated_at?: Date,
    deleted?: boolean,

    // Derived columns
    notes_count?: number,
}

/** An encounter is an appointment, stay, or other continuous event involving advocate and client */
export const EncounterTable: DbTable<EncounterRow> = {
    table: 'encounter',
    sortOrder: ['created_at'],
    deletedFlag: true,
    populateOnInsert: {
        id: 'uuid',
        started_at: 'now',
        created_at: 'now',
        updated_at: 'now',
    },
    populateOnUpdate: {
        updated_at: 'now',
    },
}
