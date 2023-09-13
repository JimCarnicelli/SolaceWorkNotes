import { apiUserList } from './_def';
import { dbCore } from '@/lib/db/dbServer';
import { UserTable } from '@/lib/db/entities/UserTable';

export async function userList(props: apiUserList.Params) {
    return await dbCore.getTable({
        table: UserTable,
        withCount: true,
        where: `
            ${dbCore.textSearchFilter(props.filterText, ['name'])}
            ${props.advocateId
                ? `
                    AND id IN (
                        SELECT client_id
                        FROM encounter
                        WHERE advocate_id = ${dbCore.safeValue(props.advocateId)}
                        AND deleted = FALSE
                    )`
                : ''
            }
        `,
        order: ['name'],
        columns: [
            dbCore.allColumns(),
            dbCore.colExpr('started_at', props.advocateId
                ? `
                    SELECT MIN(started_at)
                    FROM encounter
                    WHERE client_id = t.id
                    AND advocate_id = ${dbCore.safeValue(props.advocateId)}
                `
                : 'NULL'
            ),
            dbCore.colExpr('latest_at', props.advocateId
                ? `
                    SELECT MAX(started_at)
                    FROM encounter
                    WHERE client_id = t.id
                    AND advocate_id = ${dbCore.safeValue(props.advocateId)}
                `
                : 'NULL'
            ),
        ],
        skip: props.skip,
        take: props.take,
    });
}