import { apiServer } from '@/lib/utilities/apiServer';
import { apiUserGet } from './_def';
import { userGet } from './userGet';

/** One API endpoint */
export const POST = apiServer.handler<apiUserGet.Params, apiUserGet.Return>(async (req) => {
    return {
        item: await userGet(req.p.id),
    };
});
