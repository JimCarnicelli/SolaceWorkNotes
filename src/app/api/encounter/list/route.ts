import { apiServer } from '@/lib/utilities/apiServer';
import { apiEncounterList } from './_def';
import { encounterList } from './encounterList';

/** One API endpoint */
export const POST = apiServer.handler<apiEncounterList.Params, apiEncounterList.Return>(async (req) => {
    const list = await encounterList(req.p);
    return { list };
});
