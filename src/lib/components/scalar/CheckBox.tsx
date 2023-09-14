import './CheckBox.scss';
import { ChangeEvent, MutableRefObject, ReactNode, useMemo } from 'react';
import { InputKeyEvent } from '@/lib/components/scalar/TextBox';
import { FieldState } from '@/lib/hooks/useForm';
import { cn } from '@/lib/utilities/stringHelpers';
import { TooltipMessage, useTooltip } from '@/lib/hooks/useTooltip';

type Props = {
    field?: FieldState<boolean>,
    title?: ReactNode,
    tooltip?: TooltipMessage,
    marginLeft?: boolean,
    marginRight?: boolean,
    className?: string,
    inputRef?: MutableRefObject<HTMLElement | null>,
    name?: string,
    disabled?: boolean,
    value?: boolean | undefined,
    setValue?: (value: boolean | undefined) => void,
    onFocus?: () => void,
    onBlur?: () => void,
    onKeyDown?: (ev: InputKeyEvent) => void,
    onKeyUp?: (ev: InputKeyEvent) => void,
    onEnterKey?: () => void,
    onEscapeKey?: () => void,
}

export function CheckBox(props: Props) {

    const field = props.field;
    let value = props.value ?? field?.value;

    const tooltip = useTooltip();

    function setValue(v: boolean | undefined) {
        props.setValue?.(v);
        field?.setValue?.(v, true);
    }

    function onChange(ev: ChangeEvent<HTMLInputElement>) {
        setValue(ev.target.checked);
        props.field?.setTouched?.(true);
    }

    function onBlur() {
        field?.setTouched?.(true);
        props.onBlur?.();
    }

    function onKeyDown(ev: any) {
        const newEv = ev as InputKeyEvent;
        if (props.onKeyDown) {
            props.onKeyDown(newEv);
        }
    }

    function onKeyUp(ev: any) {
        const newEv = ev as InputKeyEvent;
        if (props.onKeyUp) {
            props.onKeyUp(newEv);
        } else {
            switch (ev.key) {
                case 'Enter':
                    ev.stopPropagation();
                    props.onEnterKey?.();
                    break;
                case 'Escape':
                    ev.stopPropagation();
                    props.onEscapeKey?.();
                    break;
            }
        }
    }

    return (
        <label
            className={
                'CheckBox' +
                cn(props.className) +
                cn('MarginLeft', props.marginLeft) +
                cn('MarginRight', props.marginRight)
            }
            {...tooltip(props.tooltip)}
        >
            <input
                type='checkbox'
                name={props.name}
                checked={value ?? false}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onKeyUp={onKeyUp}
                onFocus={props.onFocus}
                onBlur={onBlur}
            />
            {(props.title ?? field?.title) && (
                <span>{props.title ?? field?.title}</span>
            )}
        </label>
    );
}
