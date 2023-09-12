'use client';
import './MessageBox.scss';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useGlobalState } from '@/lib/hooks/useGlobalState';
import { Modal } from '@/lib/components/layout/Modal';
import { Button } from '@/lib/components/action/Button';
import { icons, IconType } from '@/lib/components/graphics/Icon';
import { cn } from '@/lib/utilities/stringHelpers';

export type MessageBoxButton = {
    title: ReactNode,
    icon?: IconType,
    onClick: () => void,
}

export type MessageBoxFlavor = 'Default' | 'Error' | 'Warning' | 'YesNo';

export type MessageBoxProps = {
    message: ReactNode,
    flavor?: MessageBoxFlavor,
    icon?: ReactNode | IconType,
    okayTitle?: ReactNode,
    okayIcon?: IconType,
    cancelTitle?: ReactNode,
    onOkay?: () => void,
    onCancel?: () => void,
    buttons?: MessageBoxButton[],
}

export type MessageBoxHook = {
    show: (props: MessageBoxProps) => void,
    showError: (message: ReactNode) => void,
    showDelete: (
        message: ReactNode,
        action: 'Delete' | 'Remove' | 'Detach',
        onDelete: () => void,
        onCancel?: () => void,
    ) => void,
    showYesNo: (
        message: ReactNode,
        onYes?: () => void,
        onNo?: () => void,
        onCancel?: () => void
    ) => void,
    cancel: () => void,
};

/** Hook for displaying a popup message box */
export function useMessageBox() {

    const gsApp = useGlobalState('App');
    const [_, setMsgBox] = gsApp.useState<MessageBoxProps | undefined>('MsgBox');

    /** Show the user a dialog box with a simple message */
    function show(props: MessageBoxProps) {
        setMsgBox(props);
    }

    /** Display an error message without actions */
    function showError(message: ReactNode) {
        setMsgBox({
            message: message,
            flavor: 'Error',
        });
    }

    /** Display a question for the user with Yes and No actions */
    function showDelete(
        message: ReactNode,
        action: 'Delete' | 'Remove' | 'Detach',
        onDelete: () => void,
        onCancel?: () => void
    ) {
        setMsgBox({
            message: message,
            flavor: 'Error',
            okayTitle: action,
            onOkay: onDelete ?? (() => { }),
            onCancel: onCancel,
        });
    }

    /** Display a question for the user with Yes and No actions */
    function showYesNo(
        message: ReactNode,
        onYes?: () => void,
        onNo?: () => void,
        onCancel?: () => void
    ) {
        setMsgBox({
            message: message,
            flavor: 'YesNo',
            okayTitle: 'Yes',
            okayIcon: icons.FaCheck,
            onOkay: onYes ?? (() => { }),
            onCancel: onCancel,
        });
    }

    /** Display a question for the user with Yes and No actions */
    function showOkay(
        message: ReactNode,
        onOkay?: () => void,
        onCancel?: () => void
    ) {
        setMsgBox({
            message: message,
            flavor: 'YesNo',
            okayTitle: 'OK',
            onOkay: onOkay ?? (() => { }),
            onCancel: onCancel,
        });
    }

    /** Hide the current message box if any */
    function cancel() {
        setMsgBox(undefined);
    }

    return { show, showError, showDelete, showYesNo, showOkay, cancel };
}


/** See useMessageBox() to use this component */
export function MessageBox() {

    const [currentMsg, setCurrentMsg] = useState<MessageBoxProps | undefined>();
    const [show, setShow] = useState(false);
    const [ignoreSwitch, setIgnoreSwitch] = useState(false);

    const gsApp = useGlobalState('App');
    const [msgBox, setMsgBox] = gsApp.useState<MessageBoxProps | undefined>('MsgBox');

    const okay = useCallback(() => {
        currentMsg?.onOkay?.();
        setShow(false);
    }, [currentMsg]);

    const cancel = useCallback(() => {
        currentMsg?.onCancel?.();
        setShow(false);
    }, [currentMsg]);

    useEffect(() => {
        if (ignoreSwitch) {
            setIgnoreSwitch(false);
            return;
        }
        if (msgBox) {
            setCurrentMsg({...msgBox});
            setShow(true);
            setIgnoreSwitch(true);
            setMsgBox(undefined);
        } else {
            setCurrentMsg(undefined);
            setShow(false);
        }
    }, [msgBox]);  // eslint-disable-line react-hooks/exhaustive-deps

    function onButtonClick(onClick: () => void) {
        onClick();
        setShow(false);
    }

    if (!currentMsg) return <></>;

    let icon : ReactNode | undefined = undefined;
    let okayTitle: ReactNode | undefined = undefined;
    let cancelTitle : ReactNode | undefined = undefined;

    switch (currentMsg?.flavor) {
        case 'Error':
            icon = <icons.FaExclamationTriangle />;
            break;
        case 'YesNo':
            icon = <icons.FaQuestionCircle />;
            okayTitle = 'Yes';
            break;
    }

    if (currentMsg.icon) {
        if (typeof currentMsg.icon === 'function') {
            icon = <currentMsg.icon />;
        } else {
            icon = currentMsg.icon;
        }
    }
    if (currentMsg.okayTitle) okayTitle = currentMsg.okayTitle;
    if (currentMsg.cancelTitle) cancelTitle = currentMsg.cancelTitle;

    const mainButtonCount = (currentMsg.onOkay ? 1 : 0) +
        (currentMsg.buttons?.length ?? 0)

    return (
        <Modal
            show={show}
            onMaskClick={cancel}
            onEnterPress={okay}
            onEscapePress={cancel}
        >
            <section className={
                'Panel MessageBox' +
                cn('Flavor' + currentMsg?.flavor, currentMsg?.flavor)
            }>

                <div className='ScrollingMessage'>
                    <div className='MessageBlock'>
                        {icon && (
                            <div className='Icon'>
                                {icon}
                            </div>
                        )}
                        <div className='Message'>
                            {currentMsg?.message}
                        </div>
                    </div>
                </div>

                <div className='Actions'>
                    {currentMsg?.onOkay && (
                        <Button
                            flavor='Solid'
                            title={okayTitle ?? 'Okay'}
                            icon={currentMsg.okayIcon}
                            onClick={okay}
                        />
                    )}
                    {currentMsg.buttons?.map((btn, i) => (
                        <Button
                            key={i}
                            flavor='Solid'
                            title={btn.title}
                            icon={btn.icon}
                            onClick={() => onButtonClick(btn.onClick)}
                        />
                    ))}
                    {mainButtonCount > 0
                        ? <Button title={cancelTitle ?? 'Cancel'} onClick={cancel} />
                        : <Button flavor='Solid' title={cancelTitle ?? 'Okay'} onClick={cancel} />
                    }
                </div>

            </section>
        </Modal>
    );
}
