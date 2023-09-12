import { dbCore } from '@/lib/db/dbServer';
import { UserTable } from '@/lib/db/entities/UserTable';
import { Guid } from '@/lib/db/dbShared';

/** Fetch a single user record */
export async function userGet(id: Guid) {
    return await dbCore.getRow({
        table: UserTable,
        where: { id },
    });
}
