// Nabbed from: https://www.joshwcomeau.com/snippets/react-hooks/use-interval/

import React, { useEffect } from 'react';

/**
 * Hook for setInterval() that respects React's state
 * @param callback  Some code you want to execute periodically
 * @param delay  In milliseconds. Set this to 0 to disable the timer.
 * 
 * Note that your callback won't execute immediately. It will first execute after 
 * the elapsed delay. Then again after the next delay. And so on. This is great for 
 * polling situations where you need to periodically update some display or 
 * freshen data. Here's an example usage:
 * 
 *     useInterval(() => {
 *         console.log('Hi there!');
 *     }, 10 * 1000);  // Every 10 seconds
 */
export default function useInterval(callback: () => void, delay: number) {
    const intervalId = React.useRef<number | undefined>(undefined);
    const savedCallback = React.useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    });

    useEffect(() => {
        // Cleanup when this hook is disposed of
        return () => {
            window.clearInterval(intervalId.current);
        }
    }, []);

    useEffect(() => {
        const tick = () => savedCallback.current();
        window.clearInterval(intervalId.current); // Cancel any existing timer
        if (delay > 0)  // Start with a fresh timer
            intervalId.current = window.setInterval(tick, delay);
    }, [delay]);

    return intervalId.current;
}
