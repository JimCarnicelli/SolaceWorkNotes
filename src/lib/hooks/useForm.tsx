import { ReactNode, useState, useEffect, SetStateAction, useCallback } from 'react';
import { formatDecimal } from '@/lib/utilities/formatters';
import { toast } from '@/lib/utilities/toastNotifications';
import { Guid } from '@/lib/db/dbShared';
import { useLeavingPage } from '@/lib/hooks/useLeavingPage';

type FieldValidator<T> = (value: T | undefined) => string | undefined;
type FieldFormatter<T> = (value: string | undefined) => string | undefined;

export type FieldDef<T> = {
    title?: string,
    required?: boolean,
    minLength?: number,
    maxLength?: number,
    validator?: FieldValidator<T>,
    formatter?: FieldFormatter<T>,
    initialValue?: T | (() => T),
};

export type FieldDefs = { [name: string]: FieldDef<any> };

type Options = {
    ignoreDirty?: boolean,
}

type FieldDynamicState<T> = {
    value: T | undefined,
    touched: boolean,
    submitted: boolean,
    errorMessage: string | undefined,
};

export type FieldState<T> = FieldDef<T> & FieldDynamicState<T> & {
    name: string,
    setValue: (action: SetStateAction<T | undefined>, stillEditing?: boolean) => void,
    setTouched: (value: boolean) => void,
};

export type FormHook<T> = {
    f: { [name in keyof T]: FieldState<any> },
    errorMessage: ReactNode | undefined,
    valid: boolean,
    submitted: boolean,
    setSubmitted: (value: boolean) => void,
    setErrorMessage: (message?: ReactNode | undefined) => void,
    busy: boolean,
    setBusy: (value: boolean) => void,
    dirty: boolean,
    setDirty: (value: boolean) => void,
    fieldDefs: FieldDefs,
    fieldNames: (keyof T)[],
    /** Create a new object with my form fields packed in as properties, typically for saving to a database */
    packItem: (id?: Guid) => { [key: string]: any },
    /** Populate my form fields with values taken from the given object, typically loaded from a database */
    unpackItem: (item?: { [key: string]: any }) => void,
};

export function useForm<T>(fieldDefs: FieldDefs, options?: Options) {
    const fieldNames = Object.keys(fieldDefs);
    if (!options) options = {};

    const [initialized, setInitialied] = useState(false);
    const [prevValues, setPrevValues] = useState<(string | undefined)[]>([]);
    const [submitted, setSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState<ReactNode>();
    const [customErrorMessage, setCustomErrorMessage] = useState<ReactNode>();
    const [fieldStates, setFieldStates] = useState<{ [name: string]: FieldDynamicState<any> }>({});
    const [busy, setBusy] = useState(false);
    const [dirty, setDirty] = useState(false);

    useLeavingPage({
        enabled: dirty && !options.ignoreDirty
    });

    useEffect(() => {
        setDirty(false);
        setInitialied(true);
    }, []);

    // Linearize the field definition object's features
    let fieldDefsA: FieldDef<any>[] = [];
    let fieldStatesA: FieldDynamicState<any>[] = [];
    let values: (string | undefined)[] = [];
    let valids: boolean[] = [];
    let valid = true;
    fieldNames.forEach(name => {
        fieldDefsA.push(fieldDefs[name]);
        const fieldState = fieldStates[name] ?? {};
        fieldState.submitted = submitted;
        fieldStatesA.push(fieldState);
        values.push(fieldState.value?.toString());
        valids.push(!fieldState.errorMessage);
        if (fieldState.errorMessage) valid = false;
    });

    // Detect changes to values
    useEffect(() => {
        if (!initialized) return;

        // Scan through every defined field looking for changes
        for (let i = 0; i < fieldNames.length; i++) {
            const value = values[i];
            //TODO: Can this optimization be rescued? Or must we check everything with every change?
            //if (i >= prevValues.length || value !== prevValues[i]) {  // Found a change
                const name = fieldNames[i];
                const fieldDef = fieldDefsA[i];

                // Validate the newly changed value
                let msg: string | undefined = undefined;
                if (fieldDef.required && (value === null || value === undefined)) {
                    msg = 'Required';
                } else if (fieldDef.maxLength && value && value.toString().length > fieldDef.maxLength) {
                    const over = value.toString().length - fieldDef.maxLength;
                    msg = 'Too long by ' + formatDecimal(over) + (over === 1 ? ' character' : ' characters');
                } else if (fieldDef.minLength && value && value.toString().length < fieldDef.minLength) {
                    const under = fieldDef.minLength - value.toString().length;
                    msg = 'Too short by ' + formatDecimal(under) + (under === 1 ? ' character' : ' characters');
                } else if (value) {
                    msg = fieldDef.validator?.(value!);
                }
                setFieldState(name, { errorMessage: msg });
            //}
        }

        setPrevValues(values);
    }, [...values, initialized]);  // eslint-disable-line react-hooks/exhaustive-deps

    // Distill out an error message when states change
    useEffect(() => {
        let invalids = valids.map((valid, i) => {
            return { n: fieldDefsA[i].title, v: valid };
        }).filter(e => !e.v).map(e => e.n);
        if (invalids.length && submitted)
            setErrorMessage(<div className='InvalidFields'>
                <label className='FieldsLabel'>Please correct these: </label>
                <ul>
                    {invalids.map((title, i) => (
                        <li key={i}>{title}</li>
                    ))}
                </ul>
            </div>);
        else
            setErrorMessage(customErrorMessage);
    }, [...valids, customErrorMessage, initialized, submitted]);  // eslint-disable-line react-hooks/exhaustive-deps

    function setFieldState(name: string, params: { [key: string]: any }) {
        setFieldStates(prev => {
            let newStates = { ...prev };
            let newState: any = newStates[name];
            if (!newState) {
                newState = {};
                newStates[name] = newState;
            }
            Object.keys(params).forEach(key => {
                // It's either an actual value or it's a function the caller wants us 
                // to call with the current value as its only argument
                let value = params[key];
                if (value instanceof Function) {
                    value = value(newState[key]);
                }
                newState[key] = value;
            });
            return newStates;
        });
    }

    function packItem(id?: Guid) {
        let newItem: { [key: string]: any } = { id };
        fieldNames.forEach(fieldName => {
            newItem[fieldName] = f[fieldName].value ?? null;
        });
        return newItem;
    }

    function unpackItem(item?: { [key: string]: any }) {
        if (!item) return;
        fieldNames.forEach(fieldName => {
            f[fieldName].setValue(item[fieldName] ?? undefined);
        });
        setDirty(false);  // This mechanism is meant for starting fresh with loaded data
    }

    let f: {[name: string]: FieldState<any>} = {};
    fieldNames.forEach(name => {
        const fieldDef = fieldDefs[name];
        f[name] = {
            ...fieldDefs[name],
            ...(fieldStates[name] ?? {  // At least return something by default
                value: undefined,
                touched: false,
                submitted: false,
                errorMessage: undefined,
            }),
            name: name,
            setValue: (value, stillEditing?: boolean) => {
                if (value && fieldDef.formatter && !stillEditing) {
                    const formattedValue = fieldDef.formatter(value.toString());
                    if (formattedValue)
                        value = formattedValue;
                }
                const currentValue = fieldStates[name]?.value;
                if (value === currentValue) return;
                setDirty(true);
                setFieldState(name, { value });
                setSubmitted(false);
                setCustomErrorMessage(undefined);
            },
            setTouched: (touched) => {
                setFieldState(name, { touched });
            },
        }
    });

    function resetSubmitted(value: boolean) {
        if (value) return;
        // Clear all validation errors and such
        fieldNames.forEach(name => {
            return setFieldState(name, {
                touched: false,
                submitted: false,
                errorMessage: undefined,
            });
        });
    }

    return {
        f,
        valid,
        errorMessage,
        setErrorMessage: setCustomErrorMessage,
        submitted,
        setSubmitted: resetSubmitted,
        busy, setBusy,
        fieldDefs,
        fieldNames,
        packItem, unpackItem,
        dirty, setDirty,
    } as FormHook<T>;
}
