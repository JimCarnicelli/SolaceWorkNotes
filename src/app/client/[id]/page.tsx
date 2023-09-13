'use client';
import { Guid } from '@/lib/db/dbShared';
import { useFetch } from '@/lib/hooks/useFetch';
import { apiUserGet } from '@/app/api/user/get/_def';
import { useRouter } from 'next/navigation';
import { apiEncounterList } from '@/app/api/encounter/list/_def';
import { currentUserId } from '@/lib/db/entities/UserTable';
import DataGrid, { dataGridRenderDataRow } from '@/lib/components/DataGrid';
import { EncounterRow, encounterStatusTitles } from '@/lib/db/entities/EncounterTable';
import { pageRoutes } from '@/lib/pageRoutes';
import { toFullDateTime } from '@/lib/utilities/dateTime';
import { apiEncounterNoteList } from '@/app/api/encounter/note/list/_def';
import { EncounterNoteRow } from '@/lib/db/entities/EncounterNoteTable';
import { MarkdownViewer } from '@/lib/components/scalar/MarkdownViewer';

const defaultPageSize = 10;

type Props = {
    params: {
        id: Guid,
    }
}

export default function Page(props: Props) {
    const itemId = props.params.id;

    const router = useRouter();

    const fetchUser = useFetch({
        fetch: () => apiUserGet.call({ id: itemId }),
    }, [itemId])

    const fetchEncounters = useFetch({
        fetch: (p) => apiEncounterList.call({
            ...p,
            advocateId: currentUserId,
            clientId: itemId,
        }),
        pageSize: defaultPageSize,
    }, [itemId]);

    const fetchNotes = useFetch({
        fetch: (p) => apiEncounterNoteList.call({
            ...p,
            advocateId: currentUserId,
            clientId: itemId,
        }),
        pageSize: defaultPageSize,
    }, [itemId]);

    if (fetchUser.loading) return (
        <div>Loading</div>
    );

    if (!fetchUser.data?.item) return (
        <div>Not found</div>
    );

    return (
        <main>

            <h1>{fetchUser.data?.item?.name}</h1>

            <h2>Encounters</h2>

            <DataGrid<EncounterRow>
                fetchHook={fetchEncounters}
                rows={fetchEncounters.data?.list}
                asTable
                withFilterText
                className='BasicTable HoverHighlight'
                renderHeader={() => [
                    'Started',
                    'Initiated by',
                    'Status',
                    'Summary',
                    'Notes',
                ]}
                renderRow={row => dataGridRenderDataRow([
                    toFullDateTime(row.data.started_at),
                    row.data.initiated_by_advocate
                        ? 'Me'
                        : 'Client',
                    encounterStatusTitles[row.data.status!],
                    row.data.summary,
                    row.data.notes_count,
                ], router, pageRoutes.clientView(row.data.id!))}
            />

            <h2>Notes</h2>

            <DataGrid<EncounterNoteRow>
                fetchHook={fetchNotes}
                rows={fetchNotes.data?.list}
                //asTable
                withFilterText
                className='BasicTable HoverHighlight'
                renderRow={row => (<>
                    {row.pageRowIndex > 0 && <hr />}
                    <div key={row.fullRowIndex} className='EncounterNote'>
                        <div className='Encounter'>
                            <label>Encounter: </label>
                            {toFullDateTime(row.data.encounter_started_at)}
                            {' | '}
                            with {row.data.encounter_client_name}
                            {' | '}
                            {row.data.encounter_initiated_by_advocate ? 'by Me' : 'by Client'}
                            {' | '}
                            {encounterStatusTitles[row.data.encounter_status!]}
                            {' | '}
                            {row.data.encounter_summary}
                        </div>
                        <div className='NoteSummary'>
                            <label>Note: </label>
                            {toFullDateTime(row.data.submitted_at)}
                            {' | '}
                            {row.data.submitted_by_id === currentUserId
                                ? <span>by Me</span>
                                : <span>by Client</span>
                            }
                        </div>
                        <MarkdownViewer key={3} value={row.data.message} />
                    </div>
                </>)}
            />

        </main>
    )
}
