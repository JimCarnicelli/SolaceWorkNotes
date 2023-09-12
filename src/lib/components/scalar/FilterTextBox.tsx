'use client';
import { icons } from '@/lib/components/graphics/Icon';
import { TextBox, TextBoxProps } from '@/lib/components/scalar/TextBox';
import { useDelayedAction } from '@/lib/hooks/useDelayedAction';
import { useEffect, useState } from 'react';
import { Spinner } from '@/lib/components/action/Spinner';

type Props = TextBoxProps & {
    immediate?: boolean,
    busy?: boolean,
};

export function FilterTextBox(props: Props) {

    const [value, setValue] = useState<string | undefined>(props.value);

    useEffect(() => {
        setValue(props.value);
    }, [props.value]);

    useDelayedAction(
        () => props.setValue?.(value),
        props.immediate ? 1 : 300,
        [value]
    );

    return (
        <TextBox
            className='FilterTextBox'
            beforeInput={
                // The space before is needed to correct vertical alignment
                <div className='Flair'>&nbsp;{
                    props.busy
                        ? <Spinner />
                        : <icons.FaSearch />
                }</div>
            }
            onEscapeKey={() => props.setValue?.(undefined)}
            {...props}
            value={value}
            setValue={setValue}
        />
    );
}
