'use client';
import { UserRow } from '@/lib/db/entities/UserTable';
import { useEffect, useState } from 'react';
import { apiUserGet } from '../api/user/get/_def';

export default function TestComponent() {

    const [user, setUser] = useState<UserRow>();

    useEffect(() => {
        async function fn() {
            const ret = await apiUserGet.call({
                id: 'acf4adb2-1397-47a7-92ae-8336b22556e6',
            });
            console.log(ret);
            setUser(ret.item);
        }
        fn();
    }, []);

    return (
        <div>
            User: {user?.name}
        </div>
    );
}
