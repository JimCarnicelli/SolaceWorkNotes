import { useRouter } from 'next/navigation';
import { pageRoutes } from '@/lib/pageRoutes';
import { DataGridRenderRowProps } from "@/lib/components/DataGrid"
import { EncounterNoteRow } from "@/lib/db/entities/EncounterNoteTable";
import { toFullDateTime } from "@/lib/utilities/dateTime";
import Link from 'next/link';
import { encounterStatusTitles } from '@/lib/db/entities/EncounterTable';
import { currentUserId } from '@/lib/db/entities/UserTable';
import { MarkdownViewer } from '@/lib/components/scalar/MarkdownViewer';
import { Button } from '@/lib/components/action/Button';
import { icons } from '@/lib/components/graphics/Icon';

type Props = {
    row: DataGridRenderRowProps<EncounterNoteRow>,
    onEditClick?: () => void,
}

export function NoteRow(props: Props) {
    const row = props.row;

    return (<>
        {row.pageRowIndex > 0 && <hr />}
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
                {' | '}
                {row.data.personal ? 'Personal' : 'Shared'}
            </div>
            <MarkdownViewer key={3} value={row.data.message} />
            <Button
                flavor='Solid'
                title={row.data.submitted_by_id === currentUserId ? 'Edit' : 'View'}
                icon={row.data.submitted_by_id === currentUserId ? icons.HiPencilSquare : icons.FaEye}
                onClick={() => props.onEditClick?.()}
            />
        </div>
    </>)
}
