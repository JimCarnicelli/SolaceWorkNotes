'use client';
import { Guid } from '@/lib/db/dbShared';
import { useFetch } from '@/lib/hooks/useFetch';
import { apiUserGet } from '@/app/api/user/get/_def';
import { useRouter } from 'next/navigation';
import { apiEncounterList } from '@/app/api/encounter/list/_def';
import { currentUserId } from '@/lib/db/entities/UserTable';
import DataGrid, { dataGridRenderDataRow } from '@/lib/components/DataGrid';
import { EncounterRow } from '@/lib/db/entities/EncounterTable';
import { pageRoutes } from '@/lib/pageRoutes';
import { toFullDateTime } from '@/lib/utilities/dateTime';
import { apiEncounterNoteList } from '@/app/api/encounter/note/list/_def';
import { EncounterNoteRow } from '@/lib/db/entities/EncounterNoteTable';

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

            {fetchUser.data?.item?.name}

            <DataGrid<EncounterRow>
                fetchHook={fetchEncounters}
                rows={fetchEncounters.data?.list}
                asTable
                withFilterText
                className='BasicTable HoverHighlight'
                renderHeader={() => [
                    'Started',
                    'Summary',
                    'Notes',
                ]}
                renderRow={row => dataGridRenderDataRow([
                    toFullDateTime(row.data.started_at),
                    row.data.summary,
                    row.data.notes_count,
                ], router, pageRoutes.clientView(row.data.id!))}
            />
            
            <DataGrid<EncounterNoteRow>
                fetchHook={fetchNotes}
                rows={fetchNotes.data?.list}
                asTable
                withFilterText
                className='BasicTable HoverHighlight'
                renderHeader={() => [
                    'Started',
                    'Message',
                ]}
                renderRow={row => dataGridRenderDataRow([
                    toFullDateTime(row.data.submitted_at),
                    row.data.message,
                ], router, pageRoutes.clientView(row.data.id!))}
            />

        </main>
    )
}
