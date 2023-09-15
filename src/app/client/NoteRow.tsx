import './NoteRow.scss';
import { pageRoutes } from '@/lib/pageRoutes';
import { DataGridRenderRowProps } from "@/lib/components/DataGrid"
import { EncounterNoteRow, EncounterNoteType, encounterNoteTypeTitles } from "@/lib/db/entities/EncounterNoteTable";
import { toShortDateTime } from "@/lib/utilities/dateTime";
import Link from 'next/link';
import { encounterStatusTitles } from '@/lib/db/entities/EncounterTable';
import { currentUserId } from '@/lib/db/entities/UserTable';
import { MarkdownViewer } from '@/lib/components/scalar/MarkdownViewer';
import { Button } from '@/lib/components/action/Button';
import { icons } from '@/lib/components/graphics/Icon';
import { Toolbar } from '@/lib/components/action/Toolbar';

type Props = {
    row: DataGridRenderRowProps<EncounterNoteRow>,
    onEditNote?: () => void,
    onNewNote?: () => void,
    onDeleteNote?: () => void,
    mixedClients?: boolean,
}

export function NoteRow(props: Props) {
    const row = props.row;

    function encounterNoteTypeIcon(type: EncounterNoteType) {
        switch (type) {
            case EncounterNoteType.directMessage:
                return <icons.FaEnvelope />;
            case EncounterNoteType.caseNote:
                return <icons.BsKeyboardFill />;
            default:
                return <icons.FaQuestionCircle />;
        }
    }

    return (<>
        <div key={row.fullRowIndex} className='NoteRow'>
            <div className='DividedText'>
                <label>Encounter</label>
                <span>{toShortDateTime(row.data.encounter_started_at)}</span>
                {props.mixedClients && (<span>
                    with&nbsp; <Link href={pageRoutes.clientView(row.data.encounter_client_id!)}>{row.data.encounter_client_name}</Link>
                </span>)}
                {row.data.encounter_initiated_by_advocate
                    ? <span>by Me</span>
                    : <span><icons.FaUserAlt /> by Client</span>
                }
                <span>{encounterStatusTitles[row.data.encounter_status!]}</span>
                <span>{row.data.encounter_summary}</span>
            </div>
            <div className='DividedText'>
                <label>Note</label>
                <span>{encounterNoteTypeIcon(row.data.type!)} {encounterNoteTypeTitles[row.data.type!]}</span>
                <span>{toShortDateTime(row.data.submitted_at)}</span>
                <span>{row.data.submitted_by_id === currentUserId
                    ? <span>by Me</span>
                    : <span><icons.FaUserAlt/> by Client</span>
                }</span>
                {row.data.personal
                    ? <span><icons.FaLock/> Personal</span>
                    : <span>Shared</span>
                }
            </div>
            <MarkdownViewer key={3} value={row.data.message} />
            <Toolbar>
                {props.mixedClients && (<>
                    <Button
                        title='Client'
                        icon={icons.FaUserAlt}
                        tooltip={'Focus on ' + row.data.encounter_client_name}
                        onClick={pageRoutes.clientView(row.data.encounter_client_id!)}
                    />
                </>)}
                {props.onEditNote && (
                    <Button
                        flavor='Solid'
                        title={row.data.submitted_by_id === currentUserId ? 'Edit note' : 'View note'}
                        icon={row.data.submitted_by_id === currentUserId ? icons.HiPencilSquare : icons.FaEye}
                        onClick={() => props.onEditNote?.()}
                    />
                )}
                {props.onDeleteNote && (
                    <Button
                        title='Delete'
                        icon={icons.FaTimes}
                        onClick={() => props.onDeleteNote?.()}
                    />
                )}
                {props.onNewNote && (
                    <Button
                        title='New note'
                        icon={icons.FaPlus}
                        onClick={() => props.onNewNote?.()}
                    />
                )}
            </Toolbar>
        </div>
    </>)
}
