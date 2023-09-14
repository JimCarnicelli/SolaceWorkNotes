import './Tooltip.scss';
import { ReactNode, useRef, useState } from 'react';
import { useGlobalState } from '@/lib/hooks/useGlobalState';
import { usePopper } from 'react-popper';
import useInterval from '@/lib/hooks/useInterval';
import { elementIsInDom } from '@/lib/utilities/misc';

export type TooltipState = {
    element: HTMLElement | undefined,
    message: ReactNode | undefined,
}

export type TooltipMessage = ReactNode | (() => ReactNode);

export type UseTooltipHook = (message: TooltipMessage) => {
    onMouseEnter: (ev: any) => void,
    onMouseLeave: (ev: any) => void,
    onTouchStart: (ev: any) => void,
    onTouchEnd: (ev: any) => void,
} | {};

export function useTooltip(): UseTooltipHook {

    const { tooltipState, setTooltipState } = useGlobalState('Any');

    // If the triggering element poofs we need to hide the tooltip
    useInterval(
        () => {
            if (!tooltipState?.element) return;  // No tooltip visible
            // No parent means the triggering element is not in the DOM any more
            if (!elementIsInDom(tooltipState.element)) {
                setTooltipState?.(undefined);
            }
        },
        tooltipState ? 100 : 0
    );

    function hoverTip(message: TooltipMessage) {

        if (!message) return {};

        function onMouseEnter(ev: MouseEvent) {
            const el = ev.currentTarget as HTMLElement;
            if (tooltipState?.element?.contains(el)) return;
            setTooltipState?.({
                element: el,
                message: typeof (message) === 'function' ? message() : message,
            });
        }

        function onMouseLeave(ev: MouseEvent) {
            setTooltipState?.(undefined);
        }

        function onTouchStart(ev: MouseEvent) {
            const el = ev.currentTarget as HTMLElement;
            if (tooltipState?.element?.contains(el)) return;
            setTooltipState?.({
                element: el,
                message: typeof (message) === 'function' ? message() : message,
            });
        }

        function onTouchEnd(ev: MouseEvent) {
            setTooltipState?.(undefined);
        }

        return { onMouseEnter, onMouseLeave, onTouchStart, onTouchEnd };
    }

    return hoverTip;
}


export function TooltipHost() {
    const { tooltipState } = useGlobalState('Any');

    const [popperArrow, setPopperArrow] = useState<HTMLDivElement | null>(null);
    const popperDivRef = useRef(null);

    const popper = usePopper(tooltipState?.element, popperDivRef.current, {
        // This strategy combined with the delayed popper.forceUpdate() allows tips to 
        // spill out of their containers
        //strategy: overlayContainers ? 'fixed' : 'absolute',
        placement: 'top',
        modifiers: [
            {
                name: 'arrow',
                options: { element: popperArrow },
            }, {  // How far to offset the menu from the parent element in pixels
                name: 'offset',
                options: { offset: [0, 6] },
            }, {  // Give some padding when an element butts up against an edge of the window
                name: 'preventOverflow',
                options: { padding: 10 }
            }
        ]
    });

    return (
        <div
            ref={popperDivRef}
            className='Tooltip'
            style={{
                display: tooltipState ? undefined : 'none',
                ...popper.styles.popper,
            }}
            {...popper.attributes.popper}
        >

            <div
                ref={setPopperArrow}
                className='Arrow'
                style={popper.styles.arrow}
            >
                <div>▲</div>
            </div>

            {tooltipState?.message}

        </div>
    );
}
