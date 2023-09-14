'use client';
import { currentUserId } from '@/lib/db/entities/UserTable';
import { formatDateForInput, formatTimeForInput, toFullDateTime, toShortDateTime } from '@/lib/utilities/dateTime';
import { Dialog } from '@/lib/components/layout/Dialog';
import { Button } from '@/lib/components/action/Button';
import { TextBox } from '@/lib/components/scalar/TextBox';
import { icons } from '@/lib/components/graphics/Icon';
import { InputHarness } from '@/lib/components/scalar/InputHarness';
import { EncounterNoteRow, encounterNoteTypeTitles } from '@/lib/db/entities/EncounterNoteTable';
import { encounterStatusTitles } from '@/lib/db/entities/EncounterTable';
import { useForm, FieldState } from '@/lib/hooks/useForm';
import { useEffect, useMemo } from 'react';
import { ContentSection } from '@/lib/components/layout/ContentSection';
import { MarkdownViewer } from '@/lib/components/scalar/MarkdownViewer';
import { CheckBox } from '@/lib/components/scalar/CheckBox';

type Props = {
    show: boolean,
    setShow: (value: boolean) => void,
    note: EncounterNoteRow | undefined,
}

export function EditNote(props: Props) {

    const form = useForm<{
        message: FieldState<string>,
        submitted_at_date: FieldState<string>,
        submitted_at_time: FieldState<string>,
    }>(
        useMemo(() => ({
            message: {
                title: 'Message',
                required: true,
                minLength: 20,
                maxLength: 300,
            },
            submitted_at_date: {
                title: 'Submitted',
                required: true,
            },
            submitted_at_time: {
                title: 'At',
                required: true,
            },
        }), [])
    );

    useEffect(() => {
        if (!props.show) return;
        form.unpackItem(props.note);
    }, [props.show]);  // eslint-disable-line react-hooks/exhaustive-deps

    const readOnly = props.note?.submitted_by_id === currentUserId;

    return (
        <Dialog
            title='Encounter note'
            show={props.show}
            hideOnMaskClick
            onHide={() => props.setShow(false)}
            actionBar={readOnly
                ? (<>
                    <Button
                        flavor='Solid'
                        title='Save'
                        icon={icons.FaSave}
                    />
                    <Button
                        title='Cancel'
                        onClick={() => props.setShow(false)}
                    />
                </>)
                : (<>
                    <Button
                        flavor='Solid'
                        title='Close'
                        onClick={() => props.setShow(false)}
                    />
                </>)
            }
        >
            {props.note && (<>

                <ContentSection title='Encounter' className='Gapless'>
                    <div className='WrappedControls'>
                        <InputHarness title='Encounter started' simTextBox>
                            {toFullDateTime(props.note.encounter_started_at)}
                        </InputHarness>
                        <InputHarness title='Client' simTextBox marginLeft>
                            {props.note.encounter_client_name}
                        </InputHarness>
                        <InputHarness title='Initiated by' simTextBox marginLeft>
                            {props.note.encounter_initiated_by_advocate ? 'Me' : 'Client'}
                        </InputHarness>
                        <InputHarness title='Status' simTextBox marginLeft>
                            {encounterStatusTitles[props.note.encounter_status!]}
                        </InputHarness>
                    </div>
                    <div className='WrappedControls'>
                        <InputHarness title='Summary' simTextBox width='35rem' forceWidth>
                            {props.note.encounter_summary}
                        </InputHarness>
                    </div>
                </ContentSection>

                <ContentSection title='Note'>
                    <div className='WrappedControls'>
                        <InputHarness title='Submitted' simTextBox>
                            {toShortDateTime(props.note.submitted_at)}
                        </InputHarness>
                        <InputHarness title='Type' simTextBox marginLeft>
                            {encounterNoteTypeTitles[props.note.type!]}
                        </InputHarness>
                        <InputHarness title='By' simTextBox marginLeft>
                            {readOnly
                                ? <span>Me</span>
                                : <span>Client</span>
                            }
                        </InputHarness>
                        <CheckBox
                            title='Private'
                            value={props.note.personal}
                        />
                    </div>

                    {readOnly
                        ? (<>
                            <TextBox
                                field={form.f.message}
                                type='Multiline'
                                width='100%'
                                forceWidth
                                height='10rem'
                                autoFocus
                            />
                        </>)
                        : (<>
                            <InputHarness title='Message' bordered padded width='100%'>
                                <MarkdownViewer value={props.note.message} />
                            </InputHarness>
                        </>)
                    }
                </ContentSection>

            </>)}
        </Dialog>
    )
}
