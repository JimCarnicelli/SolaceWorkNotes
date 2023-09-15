'use client';
import { useState } from 'react';
import { Guid } from '@/lib/db/dbShared';
import { useFetch } from '@/lib/hooks/useFetch';
import { apiUserGet } from '@/app/api/user/get/_def';
import { apiEncounterList } from '@/app/api/encounter/list/_def';
import { currentUserId } from '@/lib/db/entities/UserTable';
import DataGrid, { dataGridRenderDataRow } from '@/lib/components/DataGrid';
import { EncounterRow, encounterStatusTitles } from '@/lib/db/entities/EncounterTable';
import { pageRoutes } from '@/lib/pageRoutes';
import { toFullDateTime } from '@/lib/utilities/dateTime';
import { apiEncounterNoteList } from '@/app/api/encounter/note/list/_def';
import { EncounterNoteRow, EncounterNoteType } from '@/lib/db/entities/EncounterNoteTable';
import { EditNote } from '../EditNote';
import { BasicPage } from '@/lib/components/layout/BasicPage';
import { ContentSection } from '@/lib/components/layout/ContentSection';
import { NoteRow } from '../NoteRow';
import { Button } from '@/lib/components/action/Button';
import { icons } from '@/lib/components/graphics/Icon';
import { useMessageBox } from '@/lib/components/action/MessageBox';
import { apiEncounterNoteDelete } from '@/app/api/encounter/note/delete/_def';
import { toast } from '@/lib/utilities/toastNotifications';

const encountersDefaultPageSize = 5;
const notesDefaultPageSize = 10;

type Props = {
    params: {
        id: Guid,
    }
}

export default function Page(props: Props) {
    const itemId = props.params.id;

    const messageBox = useMessageBox();

    const [showEditNote, setShowEditNote] = useState(false);
    const [selectedEncounterId, setSelectedEncounterId] = useState<Guid>();
    const [selectedNote, setSelectedNote] = useState<EncounterNoteRow>();

    //--------------------------------------------------------------------------------
    const fetchUser = useFetch({
        fetch: () => apiUserGet.call({ id: itemId }),
    }, [itemId]);

    //--------------------------------------------------------------------------------
    const fetchEncounters = useFetch({
        fetch: (p) => apiEncounterList.call({
            ...p,
            advocateId: currentUserId,
            clientId: itemId,
        }),
        pageSize: encountersDefaultPageSize,
    }, [itemId]);

    //--------------------------------------------------------------------------------
    const fetchNotes = useFetch({
        fetch: (p) => apiEncounterNoteList.call({
            ...p,
            advocateId: currentUserId,
            clientId: itemId,
            encounterId: selectedEncounterId,
        }),
        pageSize: notesDefaultPageSize,
    }, [itemId, selectedEncounterId]);

    //--------------------------------------------------------------------------------
    function newEncounter() {
        messageBox.show({ message: 'Not yet implemented' });
    }

    //--------------------------------------------------------------------------------
    function onEditNote(row: EncounterNoteRow) {
        setSelectedNote(row);
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
                fetchEncounters.quietRefresh();
                fetchNotes.quietRefresh();
                toast('Warning', 'Note deleted');
            }
        )
    }

    //--------------------------------------------------------------------------------
    function onNewNote(encounter: EncounterRow) {
        setSelectedNote({
            encounter_id: encounter.id,
            type: EncounterNoteType.caseNote,
            personal: true,
            submitted_by_id: currentUserId,
            submitted_at: new Date(),
            encounter_client_id: encounter.client_id,
            encounter_client_name: encounter.client_name,
            encounter_status: encounter.status,
            encounter_initiated_by_advocate: encounter.initiated_by_advocate,
            encounter_summary: encounter.summary,
            encounter_started_at: encounter.started_at,
        });
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
    function onNoteUpdated(note: EncounterNoteRow) {
        fetchEncounters.quietRefresh();
        fetchNotes.quietRefresh();
    }

    //--------------------------------------------------------------------------------
    if (fetchUser.loading) return (
        <div>Loading</div>
    );
    if (!fetchUser.data?.item) return (
        <div>Not found</div>
    );

    //--------------------------------------------------------------------------------
    return (
        <BasicPage
            title={fetchUser.data.item.name}
            goUpTitle='client list'
            onGoUp={pageRoutes.clientList()}
        >

            <ContentSection
                title='Encounters'
                collapsable
            >
                <DataGrid<EncounterRow>
                    fetchHook={fetchEncounters}
                    rows={fetchEncounters.data?.list}
                    asTable
                    withFilterText
                    className='BasicTable HoverHighlight'
                    renderHeader={() => [
                        '',
                        'Started',
                        'Initiated by',
                        'Status',
                        'Summary',
                        'Notes',
                    ]}
                    renderRow={row => dataGridRenderDataRow(
                        [
                            row.data.id === selectedEncounterId
                                ? <icons.TiArrowRightThick/>
                                : <>&nbsp;&nbsp;&nbsp;&nbsp;</>,
                            toFullDateTime(row.data.started_at),
                            row.data.initiated_by_advocate
                                ? 'Me'
                                : 'Client',
                            encounterStatusTitles[row.data.status!],
                            row.data.summary,
                            row.data.notes_count,
                        ],
                        undefined,
                        () => {
                            if (selectedEncounterId === row.data.id)
                                setSelectedEncounterId(undefined)
                            else
                                setSelectedEncounterId(row.data.id);
                        },
                        row.data.id === selectedEncounterId
                    )}
                />
            </ContentSection>

            <ContentSection
                title={selectedEncounterId
                    ? 'Notes for this encounter'
                    : 'Notes for all encounters'
                }
                collapsable
                toolbarButtons={<>
                    <Button
                        title='New encounter'
                        icon={icons.FaPlus}
                        onClick={() => newEncounter()}
                    />
                    <Button
                        title='New note'
                        icon={icons.FaPlus}
                        disabled={!selectedEncounterId}
                        onClick={() => {
                            const row = fetchEncounters.data?.list?.rows.find(row => row.id === selectedEncounterId);
                            if (row) onNewNote(row);
                        }}
                    />
                </>}
            >
                <DataGrid<EncounterNoteRow>
                    fetchHook={fetchNotes}
                    rows={fetchNotes.data?.list}
                    withFilterText
                    renderRow={row => (
                        <NoteRow
                            row={row}
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
    )
}
