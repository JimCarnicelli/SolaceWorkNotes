import { toUrl } from '@/lib/pageRoutes';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context';

/**
 * Detects whether the given element is still rooted in the DOM by checking 
 * all the way up the chain to document.body
 */
export function elementIsInDom(element: HTMLElement | undefined | null) {
    while (element) {
        if (element === document.body) return true;
        element = element.parentElement;
    }
    return false;
}

/** 
 * Detects whether the given element is within an element of a given element 
 * type (eg an A or TD element) 
 */
export function elementIsIn(
    element: HTMLElement | undefined | null,
    tagName: string,
    stopAtElement?: HTMLElement | string
) {
    while (element) {
        if (element === stopAtElement || element.tagName === stopAtElement) return false;
        if (element.tagName === tagName) return true;
        element = element.parentElement;
    }
    return false;
}

/** Sleep for the given number of milliseconds */
export const sleep = async (ms: number) => new Promise(resolve => { setTimeout(resolve, ms) });
