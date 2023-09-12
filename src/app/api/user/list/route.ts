import { apiServer } from '@/lib/utilities/apiServer';
import { apiUserList } from './_def';
import { userList } from './userList';

/** One API endpoint */
export const POST = apiServer.handler<apiUserList.Params, apiUserList.Return>(async (req) => {
    const list = await userList(req.p);
    return {
        users: list,
    };
});
