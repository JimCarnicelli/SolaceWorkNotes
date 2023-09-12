import { apiServer } from '@/lib/apiServer';
import { apiUserGet } from './_def';
import { dbCore } from '@/lib/db/dbServer';
import { UserTable } from '@/lib/db/entities/UserTable';
import { Guid } from '@/lib/db/dbShared';

/** One API endpoint */
export const POST = apiServer.handler<apiUserGet.Params, apiUserGet.Return>(async (req) => {
    return {
        user: await userGet(req.p.id),
    };
});

/** Fetch a single user record */
export async function userGet(id: Guid) {
    return await dbCore.getRow({
        table: UserTable,
        where: { id },
    });
}