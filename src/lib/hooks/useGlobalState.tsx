'use client';
import {
    createContext, Dispatch, FunctionComponent, PropsWithChildren,
    SetStateAction, useCallback, useContext, useState
} from 'react';
import { TooltipState } from './useTooltip';

type GlobalStateStore = { [key: string]: any };

type UseStateInitialValue<S> = S | (() => S);
type UseStateReturn<S> = [S, Dispatch<SetStateAction<S>>];

export interface GlobalStateContext {
    getState: <S>(componentName: string, key: string, initialValue?: UseStateInitialValue<S>) => S,
    setState: <S>(componentName: string, key: string, value: SetStateAction<S>) => void,
    clearStates: (componentName: string) => void,
    debugAllStates: (prefix?: string) => GlobalStateStore,
    tooltipState: TooltipState | undefined,
    setTooltipState: Dispatch<SetStateAction<TooltipState | undefined>>,
}

export const globalStateContext = createContext<GlobalStateContext | undefined>(undefined);

export interface UseGlobalStateReturn {
    declare: <S>(key: string, initialValue: UseStateInitialValue<S>) => UseStateReturn<S>,
};


/**
 * Returns a hook that can substitute for the standard useState() that will persist 
 * state globally so it is not lost when the component unmounts and remounts
 * 
 * @param componentName Walls off state by component so they don't bleed together
 *
 * Here's a sample usage:
 * 
 *     const gs = useGlobalState('MyFancyComponent');
 *     const [currentCustomer, setCurrentCustomer] = gs.useState<Customer>('CurrentCustomer', new Customer());
 *     const [searchResults, setSearchResults] = gs.useState<Customer[]>('SearchResults', []);
 * 
 */
export const useGlobalState = (componentName: string) => {
    const context = useContext(globalStateContext);
    return {

        /** Same behavior as React's useState(), but scope is global instead of component lifecycle 
         * 
         * React's useState() stores state for the duration of a component's lifecycle. This 
         * hook's useState() stores it for the lifecycle of the application in memory so that 
         * when the same component re-mounts later the state is still there.
         */
        useState: function <S>(key: string, initialValue?: UseStateInitialValue<S>) {
            return [
                context?.getState(componentName, key, initialValue) as S,
                (value: UseStateInitialValue<S>) => context?.setState(componentName, key, value),
            ] as UseStateReturn<S>;
        },

        /** Clears all existing states created via useState() for this single component */
        clearStates: () => context?.clearStates(componentName),

        /** Returns an optionally filtered set of the global state for read-only debugging */
        debugAllStates: () => context?.debugAllStates() ?? {},

        tooltipState: context?.tooltipState,
        setTooltipState: context?.setTooltipState,

    };
}

export const GlobalStateContextProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
    const [globalStates, setGlobalStates] = useState<GlobalStateStore>({});

    const [tooltipState, setTooltipState] = useState<TooltipState>();

    const getState = useCallback((componentName: string, key: string, initialValue?: UseStateInitialValue<any>): any => {
        const stateKey = `${componentName}/${key}`;
        if (globalStates[stateKey] !== undefined)
            return globalStates[stateKey];
        if (initialValue === undefined && globalStates[stateKey] === undefined)
            return globalStates[stateKey];
        return initialValue;
    }, [globalStates]);

    const setState = useCallback((componentName: string, key: string, valueOrFn: SetStateAction<any>): any => {
        const stateKey = `${componentName}/${key}`;
        let newValue;
        setGlobalStates(prev => {
            let newGlobalStates = { ...prev };
            let currentValue = newGlobalStates[stateKey];
            if (typeof (valueOrFn) == 'function') {
                //TODO: This breaks when used. Fix it or get rid of it.
                const fn = valueOrFn as Function;
                newValue = fn(currentValue);
            } else {
                newValue = valueOrFn;
            }
            if (newValue === currentValue) return prev;
            newGlobalStates[stateKey] = newValue;
            return newGlobalStates;
        });
        return newValue;
    }, []);

    const clearStates = useCallback((componentName: string): void => {
        let newGlobalStates = { ...globalStates };
        Object.keys(globalStates).forEach(key => {
            if (key.startsWith(`${componentName}/`)) {
                delete newGlobalStates[key];
            }
        });
        setGlobalStates(newGlobalStates);
    }, [globalStates]);

    const debugAllStates = useCallback((prefix?: string): GlobalStateStore => {
        if (!prefix) return globalStates;
        let filteredStates: GlobalStateStore = {};
        Object.keys(globalStates).forEach(key => {
            if (key.startsWith(prefix))
                filteredStates[key] = globalStates[key];
        });
        return filteredStates;
    }, [globalStates]);

    return (
        <globalStateContext.Provider value={{
            getState, setState, clearStates, debugAllStates,
            tooltipState, setTooltipState,
        }}>
            {children}
        </globalStateContext.Provider>
    );
}
