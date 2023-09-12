import { DependencyList, useEffect, useMemo, useState } from 'react';
import { useDelayedAction } from '@/lib/hooks/useDelayedAction';
import { useGlobalState } from '@/lib/hooks/useGlobalState';
import useInterval from './useInterval';

const defaultPageSize = 20;

export type FetchParams = {
    // Generic
    skip?: number,
    take?: number,
    sortColumn?: string,
    sortDescending?: boolean,
    filterText?: string,
    includeDisabled?: boolean,
    order?: string,

    // Page-specific
    //TODO: Find a less hacky way to do these
    groupByDesign?: string,  // Group by design (blank or 'N')
    store?: string,
};

export type UseFetchProps<T> = {
    globalStatePath?: string,
    fetch: (p: FetchParams) => Promise<T>,
    /** Suppress fetching because dependencies or conditions are not ready */
    suppress?: () => boolean,
    /** Delay in milliseconds before first fetch or subsequent ones. Good for debouncing. */
    delay?: number,
    /** If nonzero then keep quietly refreshing data periodically */
    refreshRateSeconds?: number,
    /** If explicitly false then I won't fetch data on first mounted */
    firstFetch?: boolean,
    initialData?: T,
    pageSize?: number,
    fetchParams?: FetchParams,
    onBeforeFetch?: () => void,
    onFetched?: (data: T | undefined, fetchHook: UseFetchHook<T>) => void,
}

export type UseFetchHook<T> = {
    data: T | undefined,
    setData: (data: T | undefined) => void,
    loading: boolean,
    refresh: () => void,
    quietRefresh: () => void,
    firstFetched: boolean,
    fetchParams: FetchParams,
    updateFetchParams: (value: FetchParams) => void,
}

export function useFetch<T>(props: UseFetchProps<T>, dependencies?: DependencyList | undefined): UseFetchHook<T> {

    const [data, setData] = useState<T | undefined>(props.initialData);
    const [loading, setLoading] = useState(false);
    const [firstFetched, setFirstFetched] = useState(false);
    const [nextFetchLoud, setNextFetchLoud] = useState(false);
    const [fetchParamsChanged, setFetchParamsChanged] = useState(false);

    const defaultFetchParams = useMemo<FetchParams>(() => ({
        skip: props.fetchParams?.skip ?? 0,
        take: props.pageSize ?? props.fetchParams?.take ?? defaultPageSize,
        sortColumn: props.fetchParams?.sortColumn,
        sortDescending: !!props.fetchParams?.sortDescending,
        filterText: props.fetchParams?.filterText,
        groupByDesign: props.fetchParams?.groupByDesign,
        includeDisabled: props.fetchParams?.includeDisabled,
        store: props.fetchParams?.store,
    }), []);  // eslint-disable-line react-hooks/exhaustive-deps

    const defaultFetchParamsJson = useMemo<string>(
        () => JSON.stringify(defaultFetchParams),
        [defaultFetchParams]
    );

    const useGs = !!props.globalStatePath;

    const gsUseFetch = useGlobalState(props.globalStatePath ?? '?');
    const [gsFetchParams, setGsFetchParams] = gsUseFetch.useState<FetchParams>('FetchParams', defaultFetchParams);
    const [lsFetchParams, setLsFetchParams] = useState<FetchParams>(defaultFetchParams);
    const fetchParams = useGs ? gsFetchParams : lsFetchParams;
    const setFetchParams = useGs ? setGsFetchParams : setLsFetchParams;

    useInterval(
        () => quietRefresh(),
        (props.refreshRateSeconds ?? 0) === 0 ? 0 : (props.refreshRateSeconds ?? 0) * 1000
    );

    // If global state was modified and we haven't fetched at all yet
    useEffect(() => {
        if (!useGs) return;
        if (firstFetched) return;
        const json = JSON.stringify(fetchParams);
        if (json === defaultFetchParamsJson) return;
        refresh();
    }, [firstFetched, defaultFetchParamsJson, fetchParams]);  // eslint-disable-line react-hooks/exhaustive-deps

    function updateFetchParams(value: FetchParams) {
        const valueKeys = Object.keys(value);
        let newParams = { ...fetchParams, ...value };

        if (
            !valueKeys.find(k => k === 'skip') &&  // .skip isn't passed in
            valueKeys.filter(k => k !== 'skip').length  // At least one thing more than .skip passed in
        ) {
            newParams.skip = 0;
        }

        if (newParams.skip === undefined || newParams.skip < 0)
            newParams.skip = 0;

        // Ignore if no changes
        if (JSON.stringify(newParams) === JSON.stringify(fetchParams))
            return;

        setFetchParamsChanged(true);
        if (valueKeys.filter(k => k !== 'skip').length)  // At least one thing more than .skip passed in
            setNextFetchLoud(true);

        setFetchParams(newParams);
    }

    async function refresh(quiet?: boolean) {
        if (nextFetchLoud) quiet = false;
        setNextFetchLoud(false);

        if (props.suppress?.()) return;
        setFirstFetched(true);
        if (!quiet) setLoading(true);
        try {
            props.onBeforeFetch?.();
            const ret: T = await props.fetch(fetchParams);
            setData(ret);
            props.onFetched?.(ret, hook);
        } catch (err: any) { }
        if (!quiet) setLoading(false);
    }

    async function quietRefresh() {
        await refresh(true);
    }

    useDelayedAction(
        refresh,
        props.delay ?? 0,
        dependencies ?? []
    );

    useEffect(() => {
        if (!firstFetched) return;
        if (props.delay) return;
        refresh();
    }, dependencies ?? []);  // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (fetchParamsChanged) {
            setFetchParamsChanged(false);
            refresh(true);
        }
    }, [fetchParamsChanged]);  // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (props.firstFetch === false) return;
        if (firstFetched) return;
        setFirstFetched(true);
        refresh();
    }, [props.firstFetch, firstFetched]);  // eslint-disable-line react-hooks/exhaustive-deps

    const hook = {
        data,
        setData,
        loading,
        refresh,
        quietRefresh,
        firstFetched,
        fetchParams,
        updateFetchParams,
    };
    return hook;
}
