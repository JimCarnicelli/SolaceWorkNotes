'use client';
import './TextBox.scss';
import { useState, ChangeEvent, useRef, MutableRefObject, ReactNode, useEffect } from 'react';
import { InputHarness, InputHarnessProps } from '@/lib/components/scalar/InputHarness';
import { icons } from '@/lib/components/graphics/Icon';
import { Button } from '@/lib/components/action/Button';
import { usePopper } from 'react-popper';

export type InputKeyEvent = {
    key: string,
    stopPropagation: () => void,
    preventDefault: () => void,
}

export type TextBoxProps = InputHarnessProps<string> & {
    inputRef?: MutableRefObject<HTMLElement | null>,
    type?: 'Multiline' | 'Text' | 'Password' | 'Email',
    name?: string,
    placeholder?: string,
    disabled?: boolean,
    autoComplete?: boolean,
    autoFocus?: boolean,
    inputClassName?: string,
    height?: string | number,
    unwrapped?: boolean,
    value?: string,
    showDropDown?: boolean,
    renderDropDown?: () => ReactNode,
    setValue?: (value: string | undefined) => void,
    onFocus?: () => void,
    onBlur?: () => void,
    onKeyDown?: (ev: InputKeyEvent) => void,
    onKeyUp?: (ev: InputKeyEvent) => void,
    onEnterKey?: () => void,
    onEscapeKey?: () => void,
    onDropDownClick?: (dropDownShowing: boolean) => void,
}

export function TextBox(props: TextBoxProps) {

    const [showPassword, setShowPassword] = useState(false);

    const withDropDown = !!props.renderDropDown;
    const dropDownShowing = !!props.showDropDown;

    const myInputRef = useRef<HTMLElement | null>(null);
    const popperDivRef = useRef(null);

    const popper = usePopper(myInputRef.current, popperDivRef.current, {
        // This strategy combined with the delayed popper.forceUpdate() allows tips to 
        // spill out of their containers
        //strategy: overlayContainers ? 'fixed' : 'absolute',
        placement: 'bottom-start',
        modifiers: [
            {  // How far to offset the menu from the parent element in pixels
                name: 'offset',
                options: { offset: [0, 0] },
            }, {  // Give some padding when an element butts up against an edge of the window
                name: 'preventOverflow',
                options: { padding: 10 }
            }
        ]
    });

    useEffect(() => {
        if (!dropDownShowing) return;
        setTimeout(() => popper.forceUpdate?.(), 1);
    }, [dropDownShowing]);  // eslint-disable-line react-hooks/exhaustive-deps

    const field = props.field;
    let value = props.value ?? field?.value ?? '';

    let afterInput = props.afterInput;
    if (props.type === 'Password') {
        afterInput = (<>
            <Button
                icon={showPassword ? icons.FaEyeSlash : icons.FaEye}
                onClick={() => setShowPassword(prev => !prev)}
            />
            {afterInput}
        </>);
    }
    if (withDropDown) {
        afterInput = (<>
            <Button
                icon={dropDownShowing ? icons.FaChevronUp : icons.FaChevronDown}
                disabled={!props.onDropDownClick}
                onClick={() => {
                    props.onDropDownClick?.(dropDownShowing);
                    if (!dropDownShowing)
                        myInputRef.current?.focus();
                }}
            />
            {afterInput}
        </>);
    }

    let inputType = props.type?.toLowerCase();
    if (showPassword) inputType = 'text';

    const withClear = props.type !== 'Multiline' && value !== '' && !props.disabled;

    function onChange(ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        let v: string | undefined = ev.target.value;
        if (v === '') v = undefined;
        setValue(v);
    }

    function setValue(v: string | undefined) {
        props.setValue?.(v);
        field?.setValue?.(v, true);
    }

    function onFocus() {
        props.onFocus?.();
    }

    function updateValue() {
        if (props.value !== undefined) {
            const newValue = props.value.trim();
            props.setValue?.(newValue);
        } else if (!!field?.value) {
            const newValue = field?.value.trim();
            if (newValue !== field?.value || props.field?.formatter) {
                props.field?.setValue?.(newValue);
            }
        }
        field?.setTouched(true);
    }

    function onBlur() {
        updateValue();
        props.onBlur?.();
    }

    function onClear() {
        const ref = myInputRef.current! as HTMLInputElement;
        ref.focus();
        ref.select();
        if (ref.value !== '') {
            try {
                document.execCommand('delete');
            } catch {  // document.execCommand() may get removed at some point
                setValue(undefined);
            }
        }
    }

    function onKeyDown(ev: any) {
        if (props.onKeyDown) {
            props.onKeyDown(ev as InputKeyEvent);
        }
    }

    function onKeyUp(ev: any) {
        if (props.onKeyUp) {
            props.onKeyUp(ev as InputKeyEvent);
        } else {
            switch (ev.key) {
                case 'Enter':
                    if (!props.onEnterKey) return;
                    ev.stopPropagation();
                    updateValue();
                    props.onEnterKey?.();
                    break;
                case 'Escape':
                    if (!props.onEscapeKey) return;
                    ev.stopPropagation();
                    props.onEscapeKey?.();
                    break;
            }
        }
    }

    let controlProps = {
        name: props.name,
        placeholder: props.placeholder,
        className: 'TextBox' + (props.inputClassName ? ' ' + props.inputClassName : ''),
        disabled: props.disabled,
        autoComplete: props.autoComplete === undefined ? undefined : (props.autoComplete ? 'on' : 'off'),
        autoFocus: props.autoFocus,
        value: value,
        onChange: onChange,
        onFocus: onFocus,
        onBlur: onBlur,
        onKeyDown: onKeyDown,
        onKeyUp: onKeyUp,
    };

    const guts = props.type === 'Multiline'
        ? (
            <textarea
                ref={el => {
                    myInputRef.current = el;
                    if (props.inputRef) props.inputRef.current = el;
                }}
                style={{
                    height: props.height,
                }}
                {...controlProps}
            />
        )
        : (
            <input
                ref={el => {
                    myInputRef.current = el;
                    if (props.inputRef) props.inputRef.current = el;
                }}
                type={inputType}
                {...controlProps}
            />
        );

    if (props.unwrapped)
        return guts;

    const dropDownEl = withDropDown ? (
        <div
            ref={popperDivRef}
            className='TextBox_DropDown'
            style={{
                ...popper.styles.popper,
                display: dropDownShowing ? 'block' : 'none',
                minWidth: props.width,
            }}
            {...popper.attributes.popper}
        >
            {props.renderDropDown!()}
        </div>
    ) : undefined;
    
    return (
        <InputHarness
            bordered
            onClear={withClear ? onClear : undefined}
            {...props}
            afterInput={afterInput}
        >
            {guts}
            {dropDownEl}
        </InputHarness>
    );
}
