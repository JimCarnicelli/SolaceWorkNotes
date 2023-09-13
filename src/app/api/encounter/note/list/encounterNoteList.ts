import { apiEncounterNoteList } from './_def';
import { dbCore } from '@/lib/db/dbServer';
import { EncounterNoteTable } from '@/lib/db/entities/EncounterNoteTable';

export async function encounterNoteList(props: apiEncounterNoteList.Params) {
    return await dbCore.getTable({
        table: EncounterNoteTable,
        withCount: true,
        where: {
            encounter_id: props.encounterId,
        },
        alsoWhere: `
            1=1
            ${props.advocateId ? `AND encounter_id IN (
                SELECT id
                FROM encounter
                WHERE advocate_id = ${dbCore.safeValue(props.advocateId)}
            )` : ''}
            ${props.clientId ? `AND encounter_id IN (
                SELECT id
                FROM encounter
                WHERE client_id = ${dbCore.safeValue(props.clientId)}
            )` : ''}
            AND ${dbCore.textSearchFilter(props.filterText, ['message'])}
        `,
        order: ['submitted_at!'],
        columns: [
            dbCore.allColumns(),
        ],
        skip: props.skip,
        take: props.take,
    });
}
