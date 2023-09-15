import { apiEncounterNoteSave } from './_def';
import { dbCore } from '@/lib/db/dbServer';
import { emptyGuid } from '@/lib/db/dbShared';
import { EncounterNoteTable } from '@/lib/db/entities/EncounterNoteTable';

export async function encounterNoteSave(props: apiEncounterNoteSave.Params) {
    const item = await dbCore.saveRow(
        EncounterNoteTable,
        { id: props.item.id ?? emptyGuid }, undefined,
        props.item,
        true
    );
    return item;
}
