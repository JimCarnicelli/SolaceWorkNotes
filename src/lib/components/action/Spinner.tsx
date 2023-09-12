import './Spinner.scss';
import { CSSProperties } from 'react';
import { icons } from '@/lib/components/graphics/Icon';
import { cn } from '@/lib/utilities/stringHelpers';

type Props = {
    size?: number,
    className?: string,
    style?: CSSProperties,
};

export function Spinner(props: Props) {

    const guts = (
        <icons.FaSpinner
            className={
                'Spinner' +
                cn(props.className)
            }
            size={props.size}
            style={props.style}
        />
    );
    return guts;
}