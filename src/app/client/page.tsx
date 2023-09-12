'use client';
import { useFetch } from '@/lib/hooks/useFetch';
import { apiUserList } from '../api/user/list/_def';
import Link from 'next/link';
import { pageRoutes } from '@/lib/pageRoutes';
import { UserRow, currentUserId } from '@/lib/db/entities/UserTable';
import { useEffect, useState } from 'react';
import { FilterTextBox } from '@/lib/components/scalar/FilterTextBox';
import { Spinner } from '@/lib/components/action/Spinner';
import DataGrid, { dataGridRenderDataRow } from '@/lib/components/DataGrid';
import { useRouter } from 'next/navigation';

const defaultPageSize = 10;

export default function Page() {

    const router = useRouter();

    const [filterText, setFilterText] = useState<string>();

    const fetchUsers = useFetch({
        fetch: (p) => apiUserList.call({
            ...p,
            advocateId: currentUserId,
        }),
        pageSize: defaultPageSize,
    })

    return (
        <main>

            <DataGrid<UserRow>
                fetchHook={fetchUsers}
                rows={fetchUsers.data?.users}
                asTable
                withFilterText
                renderHeader={() => [
                    'Name',
                ]}
                renderRow={row => dataGridRenderDataRow([
                    row.data.name,
                ], router, pageRoutes.clientView(row.data.id!))}
            />

        </main>
    )
}
