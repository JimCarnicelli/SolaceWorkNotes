'use client';
import './TabBar.scss';
import { ReactNode, SyntheticEvent, useEffect, useRef } from 'react';
import { Button, ButtonOnClick, handleButtonOnClick } from '@/lib/components/action/Button';
import { IconType } from '@/lib/components/graphics/Icon';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utilities/stringHelpers';

export type TabBarTab = {
    name: string,
    title: ReactNode,
    icon?: IconType,
    allowReClick?: boolean,
    onClick?: ButtonOnClick,
}

type Props = {
    tabs: TabBarTab[],
    className?: string,
    value?: string,
    setValue?: (tab: string) => void,
}

export function TabBar(props: Props) {

    const router = useRouter();

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (props.value) {
            if (!scrollRef.current) return;
            const scrollEl = scrollRef.current;
            const bandEl = scrollEl.children[0] as HTMLDivElement;
            if (bandEl.offsetWidth < scrollEl.offsetWidth) return;  // If the browser is wide enough to not need to scroll
            const tabEl = bandEl.querySelector(`[data-name=${props.value}]`) as HTMLElement;
            if (tabEl) {
                const left = bandEl.offsetLeft + tabEl.offsetLeft - (scrollEl.clientWidth - tabEl.offsetWidth) / 2;  // Peek to the left a little
                if (left > 0)
                    scrollEl.scrollLeft = left;                    
            }
        }
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    function onTabClick(ev: SyntheticEvent, tab: TabBarTab) {
        if (tab.name === props.value && !tab.allowReClick) return;
        props.setValue?.(tab.name);

        if (!tab.onClick) return;
        handleButtonOnClick(ev, router, tab.onClick);
    }

    return (
        <nav
            ref={scrollRef}
            className={
                'TabBar' +
                cn(props.className)
            }
        >
            <div className='Band'>
                {props.tabs.map(tab => (
                    <Button
                        key={tab.name}
                        dataName={tab.name}
                        flavor='Blank'
                        title={tab.title}
                        icon={tab.icon}
                        className={
                            'Tab' +
                            (tab.name === props.value ? ' Selected' : '')
                        }
                        onClick={tab.name !== props.value && tab.onClick && (tab.onClick as string).charAt
                            ? tab.onClick  // URL to another page
                            : ev => onTabClick(ev, tab)  // Custom handler
                        }
                    />
                ))}
            </div>
        </nav>
    );
}
