import { dbCore } from '@/lib/db/dbServer';
import { Guid, emptyGuid } from '@/lib/db/dbShared';
import { EncounterNoteTable } from '@/lib/db/entities/EncounterNoteTable';

export async function encounterNoteSave(id: Guid) {
    const item = await dbCore.updateRows(
        EncounterNoteTable,
        { id }, undefined,
        { deleted: true }
    );
    return item;
}
