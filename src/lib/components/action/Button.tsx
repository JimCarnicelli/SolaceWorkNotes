'use client';
import './Button.scss';
import { useRouter } from 'next/navigation';
import { ReactNode, forwardRef } from 'react';
import { icons, IconType } from '@/lib/components/graphics/Icon';
import { cn } from '@/lib/utilities/stringHelpers';
import Link from 'next/link';
import { SyntheticEvent } from 'react';
import { Spinner } from '@/lib/components/action/Spinner';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';

export type ButtonOnClick =
    string |
    ((ev: SyntheticEvent) => string | undefined) |
    ((ev: SyntheticEvent) => void);

type Props = {
    flavor?: 'Solid' | 'Hollow' | 'Link' | 'Blank',  // Default to Hollow
    title?: ReactNode,
    dataName?: string,
    icon?: IconType,
    iconPosition?: 'Left' | 'Right',  // Default to left
    disabled?: boolean,
    busy?: boolean,
    allowClickOnBusy?: boolean,
    marginLeft?: boolean,
    marginRight?: boolean,
    marginBottom?: boolean,
    className?: string,
    dropDown?: boolean,
    onClick?: ButtonOnClick,
    /** If onClick is a URL this will be a link, but you can still trap onClick */
    onLinkClick?: (ev: SyntheticEvent) => void,
    linkTarget?: string,
}

/** Encapsulates the nuances of handling users clicking a buton */
export function handleButtonOnClick(
    ev: SyntheticEvent,
    router: AppRouterInstance,
    onClick: ButtonOnClick | undefined
) {
    if (!onClick) return;
    if ((onClick as string).charAt) {
        router.push(onClick as string);
    } else {
        const url = (onClick as Function)(ev);
        if (url && typeof url === 'string') router.push(url);
    }
}

export const Button = forwardRef<HTMLElement, Props>((props, ref) => {

    const router = useRouter();

    function onClick(ev: SyntheticEvent) {
        if (props.busy && !props.allowClickOnBusy) return;
        handleButtonOnClick(ev, router, props.onClick);
    }

    const guts = (<>
        <span className='Inliner'>&nbsp;</span>
        {props.busy && (
            <div className='BusySpinner'>
                <Spinner />
            </div>
        )}
        {props.icon && props.iconPosition !== 'Right' && (
            <props.icon className='Icon Left'/>
        )}
        {props.title && (<label>{props.title}</label>)}
        {props.icon && props.iconPosition === 'Right' && (
            <props.icon className='Icon Right' />
        )}
        {props.dropDown !== undefined && (
            <span className='DropDown'>
                {props.dropDown
                    ? <icons.GoTriangleUp />
                    : <icons.GoTriangleDown />
            }
            </span>
        )}
    </>);

    const className =
        'Button' +
        cn(props.flavor) +
        cn('MarginLeft', props.marginLeft) +
        cn('MarginRight', props.marginRight) +
        cn('MarginBottom', props.marginBottom) +
        cn(props.className);

    // If we have a URL string then we'll return an SEO-friendly link
    if (!props.disabled && props.onClick && (props.onClick as string).charAt) {
        return (
            <Link
                ref={ref as any}
                data-name={props.dataName}
                className={className + cn('Busy', props.busy)}
                href={props.onClick as string}
                target={
                    props.linkTarget ??
                    ((props.onClick as string).startsWith('http')
                        ? '_blank'  // External links go to a new tab by default
                        : undefined
                    )
                }
                onClick={ev => props.onLinkClick?.(ev)}
            >
                {guts}
            </Link>
        );

    // Otherwise we'll return a button element with onClick handler
    } else {
        return (
            <button
                ref={ref as any}
                data-name={props.dataName}
                className={className + cn('Busy', props.busy)}
                disabled={props.disabled}
                onClick={ev => onClick(ev)}
            >
                {guts}
            </button>
        );

    }

});
Button.displayName = 'Button';
