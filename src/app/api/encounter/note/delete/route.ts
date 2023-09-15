import { apiServer } from '@/lib/utilities/apiServer';
import { apiEncounterNoteDelete } from './_def';
import { encounterNoteSave } from './encounterDelete';

/** One API endpoint */
export const POST = apiServer.handler<apiEncounterNoteDelete.Params, apiEncounterNoteDelete.Return>(async (req) => {
    const item = await encounterNoteSave(req.p.id);
    return { item };
});
