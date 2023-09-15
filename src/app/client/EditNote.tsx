'use client';
import { currentUserId } from '@/lib/db/entities/UserTable';
import { toFullDateTime, toShortDateTime } from '@/lib/utilities/dateTime';
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
import { useMessageBox } from '@/lib/components/action/MessageBox';
import { apiEncounterNoteSave } from '../api/encounter/note/save/_def';
import { toast } from '@/lib/utilities/toastNotifications';

type Props = {
    show: boolean,
    setShow: (value: boolean) => void,
    note: EncounterNoteRow | undefined,
    setNote?: (note: EncounterNoteRow) => void,
}

export function EditNote(props: Props) {

    const messageBox = useMessageBox();

    //--------------------------------------------------------------------------------
    const form = useForm<{
        message: FieldState<string>,
        submitted_at: FieldState<string>,
        personal: FieldState<boolean>,
    }>(
        useMemo(() => ({
            message: {
                title: 'Message',
                required: true,
                minLength: 20,
                maxLength: 300,
            },
            submitted_at: {
                title: 'Submitted',
                required: true,
            },
            personal: {
                title: 'Personal'
            },
        }), [])
    );

    //--------------------------------------------------------------------------------
    useEffect(() => {
        if (!props.show) return;
        form.unpackItem(props.note);
    }, [props.show]);  // eslint-disable-line react-hooks/exhaustive-deps

    const readOnly = props.note?.submitted_by_id !== currentUserId;

    //--------------------------------------------------------------------------------
    function onChangePersonal(value: boolean) {
        if (!value) {
            messageBox.showOkay(
                'Okay to share this with the client?',
                () => form.f.personal.setValue(false),
                () => form.f.personal.setValue(true)
            );
        } else {
            form.f.personal.setValue(value);
        }
    }

    //--------------------------------------------------------------------------------
    async function onSave() {
        let item = form.packItem(props.note?.id) as EncounterNoteRow;
        item.encounter_id = props.note?.encounter_id;
        item.type = props.note?.type;
        item.submitted_by_id = currentUserId;

        const newItem = await apiEncounterNoteSave.call({ item });
        form.setDirty(false);
        props.setNote?.(newItem.item);
        props.setShow(false);
        toast('Success', 'Note saved');
    }

    //--------------------------------------------------------------------------------
    function onCancel() {
        if (form.dirty) {
            messageBox.show({
                message: `You have unsaved changes. Sure you want to leave?`,
                onOkay: () => {
                    form.setDirty(false);
                    props.setShow(false)
                },
                okayTitle: 'Leave',
                cancelTitle: 'Stay',
            });
        } else {
            form.setDirty(false);
            props.setShow(false);
        }
    }

    //--------------------------------------------------------------------------------
    return (
        <Dialog
            title='Encounter note'
            show={props.show}
            hideOnMaskClick={!form.dirty}
            hideOnEscape={readOnly}
            onHide={() => props.setShow(false)}
            actionBar={readOnly
                ? (<>
                    <Button
                        flavor='Solid'
                        title='Close'
                        onClick={() => props.setShow(false)}
                    />
                </>)
                : (<>
                    <Button
                        flavor='Solid'
                        title='Save'
                        icon={icons.FaSave}
                        onClick={onSave}
                    />
                    <Button
                        title='Cancel'
                        onClick={onCancel}
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
                            {toShortDateTime(form.f.submitted_at.value)}
                        </InputHarness>
                        {!readOnly && (
                            <Button
                                flavor='Solid'
                                title='Now'
                                onClick={() => {
                                    form.f.submitted_at.setValue(new Date());
                                }}
                            />
                        )}
                        <InputHarness title='Type' simTextBox marginLeft>
                            {encounterNoteTypeTitles[props.note.type!]}
                        </InputHarness>
                        <InputHarness title='By' simTextBox marginLeft>
                            {readOnly
                                ? <span>Client</span>
                                : <span>Me</span>
                            }
                        </InputHarness>
                        <CheckBox
                            field={form.f.personal}
                            setValue={value => onChangePersonal(!!value)}
                        />
                    </div>

                    {readOnly
                        ? (<>
                            <InputHarness title='Message' bordered padded width='100%'>
                                <MarkdownViewer value={props.note.message} />
                            </InputHarness>
                        </>)
                        : (<>
                            <TextBox
                                field={form.f.message}
                                type='Multiline'
                                width='100%'
                                forceWidth
                                height='10rem'
                                autoFocus
                            />
                        </>)
                    }
                </ContentSection>

            </>)}
        </Dialog>
    )
}
