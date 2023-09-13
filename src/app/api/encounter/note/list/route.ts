import { apiServer } from '@/lib/utilities/apiServer';
import { apiEncounterNoteList } from './_def';
import { encounterNoteList } from './encounterNoteList';

/** One API endpoint */
export const POST = apiServer.handler<apiEncounterNoteList.Params, apiEncounterNoteList.Return>(async (req) => {
    const list = await encounterNoteList(req.p);
    return { list };
});
