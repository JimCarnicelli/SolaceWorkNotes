import './Toolbar.scss';
import { cn } from '@/lib/utilities/stringHelpers';
import { ReactNode } from 'react';

type Props = {
    centered?: boolean,
    marginBottom?: boolean,
    className?: string,
    children?: ReactNode,
}

export function Toolbar(props: Props) {

    if (!props.children)
        return <></>;

    return (
        <nav className={
            'Toolbar' +
            cn('Centered', props.centered) +
            cn('MarginBottom', props.marginBottom) +
            cn(props.className)
        }>
            <div className='Band'>
                {props.children}
            </div>
        </nav>
    );
}
