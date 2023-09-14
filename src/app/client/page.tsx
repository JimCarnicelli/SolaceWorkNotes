'use client';
import { useFetch } from '@/lib/hooks/useFetch';
import { apiUserList } from '../api/user/list/_def';
import { pageRoutes } from '@/lib/pageRoutes';
import { UserRow, currentUserId } from '@/lib/db/entities/UserTable';
import DataGrid, { dataGridRenderDataRow } from '@/lib/components/DataGrid';
import { useRouter } from 'next/navigation';
import { apiEncounterNoteList } from '../api/encounter/note/list/_def';
import { EncounterNoteRow } from '@/lib/db/entities/EncounterNoteTable';
import { toFullDate } from '@/lib/utilities/dateTime';
import { EditNote } from './EditNote';
import { useState } from 'react';
import { BasicPage } from '@/lib/components/layout/BasicPage';
import { NoteRow } from './NoteRow';
import { ContentSection } from '@/lib/components/layout/ContentSection';

const defaultPageSize = 10;

export default function Page() {

    const router = useRouter();

    const [showEditNote, setShowEditNote] = useState(false);
    const [selectedNote, setSelectedNote] = useState<EncounterNoteRow>();

    //--------------------------------------------------------------------------------
    const fetchUsers = useFetch({
        fetch: (p) => apiUserList.call({
            ...p,
            advocateId: currentUserId,
        }),
        pageSize: defaultPageSize,
    }, [currentUserId]);

    //--------------------------------------------------------------------------------
    const fetchNotes = useFetch({
        fetch: (p) => apiEncounterNoteList.call({
            ...p,
            advocateId: currentUserId,
        }),
        pageSize: defaultPageSize,
    }, [currentUserId]);

    //--------------------------------------------------------------------------------
    function editNote(row: EncounterNoteRow) {
        setSelectedNote(row);
        setShowEditNote(true);
    }

    //--------------------------------------------------------------------------------
    return (
        <BasicPage
            title='My clients'
        >

            <ContentSection title='Clients' collapsable>
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
            </ContentSection>

            <ContentSection title='Notes' collapsable>
                <DataGrid<EncounterNoteRow>
                    fetchHook={fetchNotes}
                    rows={fetchNotes.data?.list}
                    withFilterText
                    renderRow={row => (
                        <NoteRow
                            row={row}
                            onEditClick={() => editNote(row.data)}
                        />
                    )}
                />
            </ContentSection>

            <EditNote
                show={showEditNote}
                setShow={setShowEditNote}
                note={selectedNote}
            />

        </BasicPage>
    );
}
