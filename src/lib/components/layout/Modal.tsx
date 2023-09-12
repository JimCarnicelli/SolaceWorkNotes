'use client';
import './Modal.scss';
import { useGlobalState } from '@/lib/hooks/useGlobalState';
import { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utilities/stringHelpers';

const firstIndex = 10000;

type Props = {
    show?: boolean,
    transparent?: boolean,
    children?: ReactNode,
    maskClassName?: string,
    onMaskClick?: () => void,
    enableKeyboard?: boolean,  // Defaults to true
    onEnterPress?: () => void,
    onEscapePress?: () => void,
}

export function Modal(props: Props) {

    const [zIndex, setZIndex] = useState(0);
    const [keyDown, setKeyDown] = useState(false);

    const gs = useGlobalState('Modal');
    const [currentZIndex, setCurrentZIndex] = gs.useState<number>('ZIndex', firstIndex);

    const maskRef = useRef<HTMLDivElement>((undefined as any) as HTMLDivElement);

    useEffect(() => {
        if (!props.show) return;
        const newIndex = isNaN(currentZIndex) ? firstIndex : currentZIndex + 1;
        setZIndex(newIndex);
        setCurrentZIndex(newIndex);
    }, [props.show]);  // eslint-disable-line react-hooks/exhaustive-deps

    function onKeyDown(ev: KeyboardEvent) {
        switch (ev.key) {
            case 'Enter':
                ev.stopPropagation();
                setKeyDown(true);  // Indicates that the keyboard press is probably happening in my context
                break;
            case 'Escape':
                ev.stopPropagation();
                setKeyDown(true);  // Indicates that the keyboard press is probably happening in my context
                break;
        }
    }
    function onKeyUp(ev: KeyboardEvent) {
        if (!keyDown) return;  // This was probably initiated in my parent component, so we'll ignore it
        ev.stopPropagation();
        setKeyDown(false);
        switch (ev.key) {
            case 'Enter':
                props.onEnterPress?.();
                break;
            case 'Escape':
                props.onEscapePress?.();
                break;
        }
    }

    useEffect(() => {
        if (!props.show) return;
        if (!props.onEnterPress && !props.onEscapePress) return;
        if (props.enableKeyboard === false) return;
        document.addEventListener('keydown', onKeyDown, false);
        document.addEventListener('keyup', onKeyUp, false);
        return () => {  // Cleanup
            document.removeEventListener('keydown', onKeyDown, false);
            document.removeEventListener('keyup', onKeyUp, false);
        }
    });

    return (
        <div
            ref={maskRef}
            className={
                'Modal' +
                cn('Transparent', props.transparent) +
                cn('Show', props.show) +
                cn(props.maskClassName)
            }
            style={{
                zIndex: zIndex,
            }}
            onClick={ev => ev.target === maskRef.current && props.onMaskClick && props.onMaskClick()}
        >
            {props.children}
        </div>
    );
}
