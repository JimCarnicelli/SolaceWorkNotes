import './DataGrid.scss';
import { cn } from '@/lib/utilities/stringHelpers';
import { Fragment, ReactNode, useCallback, useEffect, useMemo } from 'react';
import { PagedRowset } from '@/lib/db/dbShared';
import { Button, ButtonOnClick, handleButtonOnClick } from '@/lib/components/action/Button';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context'; 
import { icons } from '@/lib/components/graphics/Icon';
import { elementIsIn } from '@/lib/utilities/misc';
import { UseFetchHook } from '@/lib/hooks/useFetch';
import { FilterTextBox } from '@/lib/components/scalar/FilterTextBox';
import { SelectBox, SelectOption } from '@/lib/components/scalar/SelectBox';
import Head from 'next/head';
import { formatDecimal } from '@/lib/utilities/formatters';

export type DataGridRenderItemProps<T> = {
    /** Total rows in the total rowset on the server */
    totalRows: number,
    /** Number of rows in the current page */
    currentRows: number,
    /** How many rows did we skip to get to the start of this page of rows? */
    skip: number,
    /** How many rows could possibly be in this page of rows? */
    take: number | undefined,
}

export type DataGridRenderRowProps<T> = DataGridRenderItemProps<T> & {
    /** Data row */
    data: T,
    /** Index of the visible row in the current page */
    pageRowIndex: number,
    /** Index of this row in the total rowset on the server */
    fullRowIndex: number,
}

type Props<T> = {
    fetchHook?: UseFetchHook<any>,
    rows?: PagedRowset<T> | T[],
    loading?: boolean,
    asTable?: boolean,
    withFilterText?: boolean,
    withPager?: boolean,  // Defaults to true
    hideOnNone?: boolean,
    autoFocusFilterText?: boolean,
    className?: string,
    renderFilterBar?: () => ReactNode,
    renderContainer?: (props: DataGridRenderItemProps<T> & { children: ReactNode }) => JSX.Element,
    renderHeader?: (props: DataGridRenderItemProps<T>) => ReactNode,
    renderFooter?: (props: DataGridRenderItemProps<T>) => ReactNode,
    renderNoneFound?: () => ReactNode,
    renderRow: (props: DataGridRenderRowProps<T>) => ReactNode,
    skip?: number,
    take?: number,
    seoPreviousLink?: string,
    seoNextLink?: string,
    onFetchPage?: (skip: number, take: number) => void,
}

//================================================================================

export default function DataGrid<T>(props: Props<T>) {
    const {
        fetchHook, rows, onFetchPage, asTable,
        renderFilterBar, renderContainer, renderHeader, renderFooter, renderRow,
    } = props;

    const pagedRowset = rows ?? (fetchHook?.data?.list as PagedRowset<T> | T[] | undefined);

    const dataRows = useMemo(() => {
        return (
            (pagedRowset as PagedRowset<T>)?.rows ??
            (pagedRowset as T[]) ??
            []
        );
    }, [pagedRowset]);

    const currentRows = dataRows.length;

    const totalRows = useMemo(() => {
        const totalRows = (
            (pagedRowset as PagedRowset<T>)?.count ??
            currentRows
        );
        return totalRows;
    }, [currentRows, pagedRowset]);

    const skip = props.skip ?? fetchHook?.fetchParams.skip ?? 0;
    const take = props.take ?? fetchHook?.fetchParams.take;
    const loading = props.loading ?? fetchHook?.loading;

    const fetchPage = useCallback((skip: number, take2: number) => {
        onFetchPage?.(skip, take2);
        if (take2 === take)
            fetchHook?.updateFetchParams({ skip });
        else
            fetchHook?.updateFetchParams({ skip, take: take2 });
    }, [take, fetchHook, onFetchPage]);

    const refresh = useCallback(() => {
        fetchPage(0, take!)
        fetchHook?.refresh();
    }, [fetchHook, fetchPage, take]);

    useEffect(() => {
        if (skip > totalRows)
            refresh();
    }, [refresh, skip, totalRows]);

    const setTake = useCallback((value: number) => {
        fetchPage(0, value);
    }, [fetchPage]);

    //--------------------------------------------------------------------------------
    const filterBarEl = useMemo(() => {
        if (!props.withFilterText && !renderFilterBar) return undefined;
        const filterBarContents = renderFilterBar?.();
        if (!filterBarContents && !props.withFilterText) return <div className='FilterBar' />;
        return (
            <div className='FilterBar'>

                {props.withFilterText && (
                    <FilterTextBox
                        placeholder='Search'
                        autoFocus={props.autoFocusFilterText}
                        value={fetchHook?.fetchParams.filterText}
                        setValue={value => fetchHook?.updateFetchParams({ filterText: value })}
                    />
                )}

                {filterBarContents}
            </div>
        );
    }, [fetchHook, props.autoFocusFilterText, props.withFilterText, renderFilterBar]);

    //--------------------------------------------------------------------------------
    const topPagerEl = useMemo(() => {
        if (props.withPager === false) return undefined;
        if (!(onFetchPage || fetchHook) || !take) return undefined;
        return (
            <div className='TopPager'>
                {totalRows === 0
                    ? <span style={{ fontStyle: 'italic' }}>no rows</span>
                    : (<>
                        <SelectBox
                            tooltip='Page size'
                            options={pageOptions}
                            marginLeft
                            value={take}
                            setValue={value => setTake(+(value as number))}
                        />
                        <Button
                            icon={icons.FaChevronLeft}
                            tooltip='Previous page'
                            disabled={skip <= 0}
                            onClick={props.seoPreviousLink ?? (() => fetchPage(Math.max(skip - take, 0), take))}
                            onLinkClick={props.seoPreviousLink
                                ? ev => {
                                    ev.preventDefault();
                                    fetchPage(Math.max(skip - take, 0), take);
                                }
                                : undefined
                            }
                        />
                        <Button
                            icon={icons.FaChevronRight}
                            tooltip='Next page'
                            disabled={skip + take >= totalRows}
                            linkTarget='_self'
                            onClick={props.seoNextLink ?? (() => fetchPage(skip + take, take))}
                            onLinkClick={props.seoNextLink
                                ? ev => {
                                    ev.preventDefault();
                                    fetchPage(skip + take, take);
                                }
                                : undefined
                            }
                        />
                    </>)
                }
            </div>
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.withPager, props.seoNextLink, fetchHook, take, loading, refresh, totalRows, skip, fetchPage, setTake]);

    //--------------------------------------------------------------------------------
    const pageSummaryEl = useMemo(() => {
        if (props.withPager === false) return undefined;
        if (totalRows === 0) return (
            <div className='PageSummary'>No items</div>
        );
        return (
            <div className='PageSummary'>
                Showing {formatDecimal(skip + 1)} to {formatDecimal(Math.min(skip + (take ?? totalRows), totalRows))} of {formatDecimal(totalRows)} items
            </div>
        );
    }, [props.withPager, skip, take, totalRows]);

    //--------------------------------------------------------------------------------
    const headerEl = useMemo(() => {
        const ret = renderHeader?.({ totalRows, currentRows, skip, take });
        if (!ret) return undefined;
        if (asTable && Array.isArray(ret)) {
            return (
                <thead><tr>
                    {ret.map((cell, i) => (
                        <th key={i}>
                            {cell}
                        </th>
                    ))}
                </tr></thead>
            );
        }
        return ret;
    }, [renderHeader, totalRows, currentRows, skip, take, asTable]);

    //--------------------------------------------------------------------------------
    const footerEl = useMemo(() => {
        const ret = renderFooter?.({ totalRows, currentRows, skip, take });
        return ret;
    }, [currentRows, renderFooter, skip, take, totalRows]);

    //--------------------------------------------------------------------------------
    const tableEl = useMemo(() =>
        (!totalRows && props.hideOnNone)
            ? <></>
            : asTable
                ? (
                    <table className='GridTable'>
                        {headerEl}
                        <tbody>
                            {!totalRows && (props.renderNoneFound
                                ? props.renderNoneFound()
                                : <tr className='NoRows'><td colSpan={1000}>None</td></tr>
                            )}
                            {dataRows.map((row, index) => renderGridRow(
                                {
                                    data: row,
                                    totalRows, currentRows,
                                    pageRowIndex: index,
                                    fullRowIndex: skip + index,
                                    skip, take
                                },
                                renderRow,
                                !!asTable
                            ))}
                        </tbody>
                        {renderFooter && (
                            <tfoot>
                                {renderFooter?.({ totalRows, currentRows, skip, take })}
                            </tfoot>
                        )}
                    </table>
                )
                : (
                    <div className='GridTable'>
                        {renderHeader?.({ totalRows, currentRows, skip, take })}
                        {!totalRows && (props.renderNoneFound
                            ? props.renderNoneFound()
                            : <div className='NoRows'>None</div>
                        )}
                        {dataRows.map((row, index) => renderGridRow(
                            {
                                data: row,
                                totalRows, currentRows,
                                pageRowIndex: index,
                                fullRowIndex: skip + index,
                                skip, take
                            },
                            renderRow,
                            !!asTable
                        ))}
                        {footerEl}
                    </div>
                )
        , [asTable, headerEl, totalRows, dataRows, renderFooter, currentRows, skip, take, renderHeader, props, footerEl, renderRow]);

    //--------------------------------------------------------------------------------
    let containerEl = tableEl;
    if (renderContainer) {
        const Container = renderContainer;
        //({ totalRows, currentRows, skip, take });
        containerEl = (
            <Container
                totalRows={totalRows}
                currentRows={currentRows}
                skip={skip} take={take}
            >
                {tableEl}
            </Container>
        );
    }

    //--------------------------------------------------------------------------------
    let customHead: ReactNode[] = [];
    if (props.seoPreviousLink && skip > 0) customHead.push(
        <link key='Previous' rel="prev" href={props.seoPreviousLink} />
    );
    if (props.seoNextLink && take && skip + take < totalRows) customHead.push(
        <link key='Next' rel="next" href={props.seoNextLink} />
    );


    //--------------------------------------------------------------------------------
    return (<>

        {customHead && (
            <Head>
                {customHead}
            </Head>
        )}

        <div
            className={
                'DataGrid' +
                cn('AsTable', asTable) +
                cn(props.className)
            }
        >
            {(filterBarEl || topPagerEl) && (
                <div className='TopBar'>
                    {filterBarEl}
                    {pageSummaryEl}
                    {topPagerEl}
                </div>
            )}
            <div className='Content'>
                {containerEl}
            </div>
        </div>
    </>);
}

//================================================================================

function renderGridRow<T>(
    rowProps: DataGridRenderRowProps<T>,
    renderRow: (props: DataGridRenderRowProps<T>) => ReactNode | ReactNode[],
    asTable: boolean,
): ReactNode {

    const ret = renderRow(rowProps);

    if (asTable && Array.isArray(ret)) return (
        <tr key={rowProps.pageRowIndex} className='DataRow'>
            {ret.map((cell, i) => (
                <td key={i}>
                    {cell}
                </td>
            ))}
        </tr>
    );

    return (
        <Fragment key={rowProps.pageRowIndex}>
            {ret}
        </Fragment>
    );
}

//================================================================================
export function dataGridRenderDataRow(cells: ReactNode[], router?: AppRouterInstance, onClick?: ButtonOnClick, selected?: boolean, disabled?: boolean) {
    return (
        <tr
            className={
                'DataRow' +
                cn('Selected', selected) +
                cn('Disabled', disabled)
            }
            onClick={ev => {
                // <a href...> overrides row clickery
                if (elementIsIn(ev.target as HTMLElement, 'A', 'TD')) return;
                if (elementIsIn(ev.target as HTMLElement, 'BUTTON', 'TD')) return;
                if (onClick)
                    handleButtonOnClick(ev, router, onClick);
            }}
        >
            {cells.map((cell, i) => (
                <td key={i}>{cell}</td>
            ))}
        </tr>
    );
}

//================================================================================

const pageOptions: SelectOption[] = [
    { value: 1 },
    { value: 5 },
    { value: 10 },
    { value: 20 },
    { value: 50 },
    { value: 100 },
    { value: 500 },
    { value: 1000 },
];
