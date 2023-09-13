import { apiEncounterList } from './_def';
import { dbCore } from '@/lib/db/dbServer';
import { EncounterTable } from '@/lib/db/entities/EncounterTable';

export async function encounterList(props: apiEncounterList.Params) {
    return await dbCore.getTable({
        table: EncounterTable,
        withCount: true,
        where: {
            advocate_id: props.advocateId,
            client_id: props.clientId,
        },
        alsoWhere: dbCore.textSearchFilter(props.filterText, ['summary']),
        order: ['started_at!'],
        columns: [
            dbCore.allColumns(),
            dbCore.colExpr('notes_count', `
                SELECT COUNT(*)
                FROM encounter_note
                WHERE encounter_id = t.id
                AND deleted = FALSE
            `),
        ],
        skip: props.skip,
        take: props.take,
    });
}
