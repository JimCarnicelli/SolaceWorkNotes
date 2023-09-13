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
                ? `AND id IN (
                    SELECT client_id
                    FROM encounter
                    WHERE advocate_id = ${dbCore.safeValue(props.advocateId)}
                    AND deleted = FALSE
                )`
                : ''
            }
        `,
        skip: props.skip,
        take: props.take,
    });
}