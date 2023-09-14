'use client';
import { useState } from 'react';
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
import { EncounterNoteRow, EncounterNoteType } from '@/lib/db/entities/EncounterNoteTable';
import { EditNote } from '../EditNote';
import { BasicPage } from '@/lib/components/layout/BasicPage';
import { ContentSection } from '@/lib/components/layout/ContentSection';
import { NoteRow } from '../NoteRow';
import { Button } from '@/lib/components/action/Button';
import { icons } from '@/lib/components/graphics/Icon';

const encountersDefaultPageSize = 5;
const notesDefaultPageSize = 10;

type Props = {
    params: {
        id: Guid,
    }
}

export default function Page(props: Props) {
    const itemId = props.params.id;

    const router = useRouter();

    const [showEditNote, setShowEditNote] = useState(false);
    const [selectedEncounter, setSelectedEncounter] = useState<EncounterRow>();
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
            encounterId: selectedEncounter?.id,
        }),
        pageSize: notesDefaultPageSize,
    }, [itemId, selectedEncounter?.id]);

    //--------------------------------------------------------------------------------
    function editNote(row: EncounterNoteRow) {
        setSelectedNote(row);
        setShowEditNote(true);
    }

    //--------------------------------------------------------------------------------
    function newEncounter() {

        setShowEditNote(true);
    }

    //--------------------------------------------------------------------------------
    function newNote(encounter: EncounterRow) {
        setSelectedNote({
            encounter_id: encounter.id,
            type: EncounterNoteType.caseNote,
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
            >
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
                    renderRow={row => dataGridRenderDataRow(
                        [
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
                            if (selectedEncounter === row.data)
                                setSelectedEncounter(undefined)
                            else
                                setSelectedEncounter(row.data);
                        },
                        row.data === selectedEncounter
                    )}
                />
            </ContentSection>

            <ContentSection
                title={selectedEncounter
                    ? 'Notes for this encounter'
                    : 'Notes for all encounters'
                }
                toolbarButtons={<>
                    <Button
                        title='New encounter'
                        icon={icons.FaPlus}
                        onClick={() => newEncounter()}
                    />
                    {selectedEncounter && (
                        <Button
                            title='New note'
                            icon={icons.FaPlus}
                            disabled={!selectedEncounter}
                            onClick={() => newNote(selectedEncounter)}
                        />
                    )}
                </>}
            >
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
    )
}
