import { apiEncounterNoteList } from './_def';
import { dbCore } from '@/lib/db/dbServer';
import { EncounterNoteTable } from '@/lib/db/entities/EncounterNoteTable';
import { UserTable } from '@/lib/db/entities/UserTable';

export async function encounterNoteList(props: apiEncounterNoteList.Params) {

    let textFilterColumns = ['t.message'];
    if (!props.encounterId)
        textFilterColumns.push('e.summary');
    if (!props.encounterId && !props.clientId)
        textFilterColumns.push('ec.name');

    return await dbCore.getTable({
        table: EncounterNoteTable,
        joins: `
            JOIN encounter e ON e.id = t.encounter_id
            JOIN user_ ec ON ec.id = e.client_id
        `,
        where: {
            encounter_id: props.encounterId,
        },
        alsoWhere: `
            1=1
            ${props.advocateId ? `AND e.advocate_id = ${dbCore.safeValue(props.advocateId)}` : ''}
            ${props.clientId ? `AND e.client_id = ${dbCore.safeValue(props.clientId)}` : ''}
            AND ${dbCore.textSearchFilter(props.filterText, textFilterColumns)}
        `,
        order: ['submitted_at!'],
        columns: [
            dbCore.allColumns(),
            dbCore.colExpr('encounter_client_id', 'e.client_id'),
            dbCore.colExpr('encounter_client_name', 'ec.name'),
            dbCore.lookupCol(UserTable, 'submitted_by_id', 'submitted_by_name'),
            dbCore.colExpr('encounter_started_at', 'e.started_at'),
            dbCore.colExpr('encounter_status', 'e.status'),
            dbCore.colExpr('encounter_initiated_by_advocate', 'e.initiated_by_advocate'),
            dbCore.colExpr('encounter_summary', 'e.summary'),
        ],
        skip: props.skip,
        take: props.take,
        withCount: true,
    });
}
