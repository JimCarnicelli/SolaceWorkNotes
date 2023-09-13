'use client';
import { useFetch } from '@/lib/hooks/useFetch';
import { apiUserList } from '../api/user/list/_def';
import { pageRoutes } from '@/lib/pageRoutes';
import { UserRow, currentUserId } from '@/lib/db/entities/UserTable';
import DataGrid, { dataGridRenderDataRow } from '@/lib/components/DataGrid';
import { useRouter } from 'next/navigation';
import { apiEncounterNoteList } from '../api/encounter/note/list/_def';
import { EncounterNoteRow } from '@/lib/db/entities/EncounterNoteTable';
import { toFullDate, toFullDateTime, toShortDate } from '@/lib/utilities/dateTime';
import { encounterStatusTitles } from '@/lib/db/entities/EncounterTable';
import { MarkdownViewer } from '@/lib/components/scalar/MarkdownViewer';
import Link from 'next/link';

const defaultPageSize = 10;

export default function Page() {

    const router = useRouter();

    const fetchUsers = useFetch({
        fetch: (p) => apiUserList.call({
            ...p,
            advocateId: currentUserId,
        }),
        pageSize: defaultPageSize,
    }, [currentUserId]);

    const fetchNotes = useFetch({
        fetch: (p) => apiEncounterNoteList.call({
            ...p,
            advocateId: currentUserId,
        }),
        pageSize: defaultPageSize,
    }, [currentUserId]);

    return (
        <main>

            <h1>My clients</h1>

            <DataGrid<UserRow>
                fetchHook={fetchUsers}
                rows={fetchUsers.data?.list}
                asTable
                withFilterText
                className='BasicTable HoverHighlight'
                renderHeader={() => [
                    'Name', 'Since', 'Latest'
                ]}
                renderRow={row => dataGridRenderDataRow([
                    row.data.name,
                    toFullDate(row.data.started_at),
                    toFullDate(row.data.latest_at),
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
                    {row.pageRowIndex > 0 && <hr/>}
                    <div key={row.fullRowIndex} className='EncounterNote'>
                        <div className='Encounter'>
                            <label>Encounter: </label>
                            {toFullDateTime(row.data.encounter_started_at)}
                            {' | '}
                            with <Link href={pageRoutes.clientView(row.data.encounter_client_id!)}>{row.data.encounter_client_name}</Link>
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
    );
}
