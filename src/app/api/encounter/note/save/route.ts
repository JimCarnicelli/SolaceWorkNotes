import { apiServer } from '@/lib/utilities/apiServer';
import { apiEncounterNoteSave } from './_def';
import { encounterNoteSave } from './encounterSave';

/** One API endpoint */
export const POST = apiServer.handler<apiEncounterNoteSave.Params, apiEncounterNoteSave.Return>(async (req) => {
    const item = await encounterNoteSave(req.p);
    return { item };
});
