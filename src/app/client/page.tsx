'use client';
import { useFetch } from '@/lib/hooks/useFetch';
import { apiUserList } from '../api/user/list/_def';
import { pageRoutes } from '@/lib/pageRoutes';
import { UserRow, currentUserId } from '@/lib/db/entities/UserTable';
import DataGrid, { dataGridRenderDataRow } from '@/lib/components/DataGrid';
import { useRouter } from 'next/navigation';
import { apiEncounterNoteList } from '../api/encounter/note/list/_def';
import { EncounterNoteRow, EncounterNoteType } from '@/lib/db/entities/EncounterNoteTable';
import { toFullDate } from '@/lib/utilities/dateTime';
import { EditNote } from './EditNote';
import { useState } from 'react';
import { BasicPage } from '@/lib/components/layout/BasicPage';
import { NoteRow } from './NoteRow';
import { ContentSection } from '@/lib/components/layout/ContentSection';
import { toast } from '@/lib/utilities/toastNotifications';
import { apiEncounterNoteDelete } from '../api/encounter/note/delete/_def';
import { useMessageBox } from '@/lib/components/action/MessageBox';

const defaultPageSize = 10;

export default function Page() {

    const router = useRouter();
    const messageBox = useMessageBox();

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
    function onEditNote(row: EncounterNoteRow) {
        setSelectedNote(row);
        setShowEditNote(true);
    }

    //--------------------------------------------------------------------------------
    function onNewNoteFromNote(note: EncounterNoteRow) {
        setSelectedNote({
            encounter_id: note.encounter_id,
            type: EncounterNoteType.caseNote,
            personal: true,
            submitted_by_id: currentUserId,
            submitted_at: new Date(),
            encounter_client_id: note.encounter_client_id,
            encounter_client_name: note.encounter_client_name,
            encounter_status: note.encounter_status,
            encounter_initiated_by_advocate: note.encounter_initiated_by_advocate,
            encounter_summary: note.encounter_summary,
            encounter_started_at: note.encounter_started_at,
        });
        setShowEditNote(true);
    }

    //--------------------------------------------------------------------------------
    function onDeleteNote(row: EncounterNoteRow) {
        messageBox.showDelete(
            `Delete this note?`,
            'Delete',
            async () => {
                await apiEncounterNoteDelete.call({ id: row.id! });
                setSelectedNote(undefined);
                fetchNotes.quietRefresh();
                toast('Warning', 'Note deleted');
            }
        )
    }

    //--------------------------------------------------------------------------------
    function onNoteUpdated(note: EncounterNoteRow) {
        fetchNotes.quietRefresh();
    }

    //--------------------------------------------------------------------------------
    return (
        <BasicPage
            title='My clients'
            goUpTitle='home page'
            onGoUp={pageRoutes.home()}
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
                            mixedClients
                            onEditNote={() => onEditNote(row.data)}
                            onNewNote={() => onNewNoteFromNote(row.data)}
                            onDeleteNote={() => onDeleteNote(row.data)}
                        />
                    )}
                />
            </ContentSection>

            <EditNote
                show={showEditNote}
                setShow={setShowEditNote}
                note={selectedNote}
                setNote={note => onNoteUpdated(note)}
            />

        </BasicPage>
    );
}
