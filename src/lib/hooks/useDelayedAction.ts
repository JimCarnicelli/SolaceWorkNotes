import { DependencyList, useEffect, useState } from 'react';

/** Call with await to pause for some time before continuing */
export async function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/** Schedule a one-time delayed action or a recurring one every time a dependency changes */
export function useDelayedAction(action: () => void, delayMs: number, deps?: DependencyList): () => void {

    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>();
    const [mounted, setMounted] = useState(false);
    const [triggered, setTriggered] = useState(false);

    function trigger() {
        setTimeoutId(setTimeout(startTrigger, delayMs));
    }

    // On mount
    useEffect(() => {
        setMounted(true);

        // No dependencies? Start the countdown immediately on mount.
        if (!deps && delayMs > 0) {
            trigger()
        }

        return () => {
            // Clear any outstanding timeout on unmount
            clearTimeout(timeoutId);
            setMounted(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const dependencies: DependencyList = deps ? [...deps, delayMs] : [delayMs];

    // When dependencies change
    useEffect(() => {
        if (!mounted) return;
        // With every change we'll start or reset the timer
        clearTimeout(timeoutId);
        if (delayMs > 0) {
            trigger()
        }
    }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

    // After startTrigger() gets called
    useEffect(() => {
        if (!triggered) return;
        setTriggered(false);
        action();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggered]);

    function startTrigger() {
        // If we called the target action here then it would have access to the 
        // old state context. This approach means the useEffect() that notices this 
        // will have the correct context.
        setTriggered(true);
    }

    return trigger;
}
