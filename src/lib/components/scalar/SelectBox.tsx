import './SelectBox.scss';
import { ChangeEvent, MutableRefObject, useMemo } from 'react';
import { InputHarness, InputHarnessProps } from '@/lib/components/scalar/InputHarness';
import { InputKeyEvent } from '@/lib/components/scalar/TextBox';

export type SelectOption = {
    value: string | number | undefined,
    title?: string,
}

type Props = InputHarnessProps<string> & {
    inputRef?: MutableRefObject<HTMLElement | null>,
    name?: string,
    disabled?: boolean,
    autoFocus?: boolean,
    inputClassName?: string,
    unwrapped?: boolean,
    options?: SelectOption[],
    emptyTitle?: string,
    value?: string | number,
    setValue?: (value: string | number | undefined) => void,
    onFocus?: () => void,
    onBlur?: () => void,
    onKeyDown?: (ev: InputKeyEvent) => void,
    onKeyUp?: (ev: InputKeyEvent) => void,
    onEnterKey?: () => void,
    onEscapeKey?: () => void,
}

export function SelectBox(props: Props) {

    const field = props.field;
    let value = props.value ?? field?.value ?? '';

    function setValue(v: string | undefined) {
        props.setValue?.(v);
        field?.setValue?.(v, true);
    }

    function onChange(ev: ChangeEvent<HTMLSelectElement>) {
        let v: string | undefined = ev.target.value;
        if (v === '') v = undefined;
        setValue(v);
    }

    function onBlur() {
        if (props.value !== undefined) {
            props.setValue?.(props.value);
        } else if (!!field?.value) {
            props.field?.setValue?.(field?.value);
        }
        field?.setTouched(true);
        props.onBlur?.();
    }

    const optionsBlock = useMemo(() => (<>
        {props.emptyTitle !== undefined && (
            <option value={undefined}>
                {props.emptyTitle}
            </option>
        )}
        {(props.options ?? []).map((option, i) => (
            <option
                key={i}
                value={option.value}
            >
                {option.title ?? option.value}
            </option>
        ))}
    </>), [props.emptyTitle, props.options]);

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
                    if (props.onEscapeKey) {
                        props.onEscapeKey();
                    } else if (props.emptyTitle) {
                        setValue(undefined);
                    }
                    break;
            }
        }
    }

    const guts = (
        <select
            ref={el => {
                if (props.inputRef) props.inputRef.current = el;
            }}
            name={props.name}
            className={'SelectBox TextBox' + (props.inputClassName ? ' ' + props.inputClassName : '')}
            disabled={props.disabled}
            autoFocus={props.autoFocus}
            value={value}
            onChange={onChange}
            onFocus={() => props.onFocus?.()}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
        >
            {optionsBlock}
        </select>
    );

    if (props.unwrapped)
        return guts;

    return (
        <InputHarness
            bordered
            {...props}
            afterInput={props.afterInput}
        >
            {guts}
        </InputHarness>
    );
}
