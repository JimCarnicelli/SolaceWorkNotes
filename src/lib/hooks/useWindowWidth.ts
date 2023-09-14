import { useEffect, useState } from "react";
import { useDelayedAction } from "./useDelayedAction";

export function useWindowWidth() {

    const actualWindowWidth = typeof (window) === 'undefined'
        ? 0
        : window.innerWidth;

    const [width, setWidth] = useState(actualWindowWidth);
    const [windowWidth, setWindowWidth] = useState(actualWindowWidth);

    useDelayedAction(() => {
        setWindowWidth(width);
    }, 100, [width]);

    useEffect(() => {
        function updateWidth() {
            setWidth(actualWindowWidth);
        }
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [actualWindowWidth]);

    return windowWidth;
}
