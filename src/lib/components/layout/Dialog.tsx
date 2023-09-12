'use client';
import './Dialog.scss';
import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utilities/stringHelpers';
import { Modal } from '@/lib/components/layout/Modal';
import { Button } from '@/lib/components/action/Button';
import { icons } from '@/lib/components/graphics/Icon';

type Props = {
    show?: boolean,
    title?: ReactNode,
    width?: string | number,
    className?: string,
    contentClassName?: string,
    padded?: boolean,  // Defaults to true
    enableKeyboard?: boolean,  // Defaults to true
    actionBar?: ReactNode,
    hideOnMaskClick?: boolean,
    children?: ReactNode,
    onShow?: () => void,
    onHide?: () => void,
    onOkay?: () => void,
}

export function Dialog(props: Props) {

    useEffect(() => {
        props.onShow?.();
    }, [props.show]);  // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Modal
            show={props.show}
            enableKeyboard={props.enableKeyboard}
            onEscapePress={props.onHide}
            onEnterPress={props.onOkay}
            onMaskClick={() => props.hideOnMaskClick && props.onHide?.()}
        >
            <section
                className={
                    'Panel Dialog' +
                    cn(props.className)
                }
                style={{
                    maxWidth: props.width,
                    width: props.width ? '100%' : undefined,
                }}
            >
                <header>
                    <h2>
                        {props.title}
                    </h2>
                    <Button
                        flavor='Blank'
                        icon={icons.FaTimes}
                        className='Close'
                        onClick={props.onHide}
                    />
                </header>
                <main
                    className={
                        cn('Padded', props.padded === undefined || props.padded) +
                        cn(props.contentClassName)
                    }
                >
                    {props.children}
                </main>
                {props.actionBar && (
                    <footer>
                        {props.actionBar}
                    </footer>
                )}
            </section>
        </Modal>
    );
}
