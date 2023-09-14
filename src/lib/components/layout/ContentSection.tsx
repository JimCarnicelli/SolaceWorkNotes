import './ContentSection.scss';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Toolbar } from '@/lib/components/action/Toolbar';
import { icons } from '../graphics/Icon';
import { cn } from '@/lib/utilities/stringHelpers';
import { useWindowWidth } from '@/lib/hooks/useWindowWidth';
import { useDelayedAction } from '@/lib/hooks/useDelayedAction';

type Props = {
    title?: ReactNode,
    collapsable?: boolean,
    expandable?: boolean,
    toolbarButtons?: ReactNode,
    className?: string,
    contentClassName?: string,
    children: ReactNode,
    onExpandCollapse?: (expanded: boolean) => void,
}

export function ContentSection(props: Props) {

    const [initialized, setInitialized] = useState(false);
    const [collapsed, setCollapsed] = useState(!!props.expandable);
    const [inMotion, setInMotion] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);

    const expandable = !!props.collapsable || !!props.expandable;
    const windowWidth = useWindowWidth();
    const contentHeight = contentRef.current?.offsetHeight ?? 0;

    useDelayedAction(
        () => setInMotion(false),
        300,
        [collapsed]
    );

    useEffect(() => setInitialized(true), []);

    useEffect(() => {
        if (!initialized) return;
        setInMotion(true);
    }, [collapsed]);  // eslint-disable-line react-hooks/exhaustive-deps

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!contentRef.current) return;
        const contentHeight = contentRef.current.offsetHeight ?? 0;
        if (collapsed) {
            contentRef.current.style.marginTop = -contentHeight + 'px';
        } else {
            contentRef.current.style.marginTop = '0px';
        }
    }, [windowWidth, collapsed, contentHeight]);

    return (
        <section className={
            'ContentSection' +
            cn('Expandable', expandable) +
            cn('Collapsed', collapsed, 'Expanded') +
            cn(props.className)
        }>
            {props.title && (
                <h2
                    onClick={expandable
                        ? () => {
                            setCollapsed(!collapsed);
                            props.onExpandCollapse?.(collapsed);
                        }
                        : undefined
                    }
                >
                    <div className='Title'>{props.title}</div>
                    {expandable && (
                        <div className='Expander'>
                            <icons.FaChevronRight />
                        </div>
                    )}
                </h2>
            )}

            <div className={
                'Drawer' +
                cn('InMotion', inMotion)
            }>
                <div ref={contentRef} className={
                    'Content' +
                    cn(props.contentClassName)
                }>
                    <Toolbar>{props.toolbarButtons}</Toolbar>
                    {props.children}
                </div>
            </div>
        </section>
    );
}
