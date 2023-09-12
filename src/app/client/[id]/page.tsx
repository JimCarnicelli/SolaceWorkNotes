'use client';
//import styles from './page.module.scss'
import { Guid } from "@/lib/db/dbShared";
import { useFetch } from '@/lib/hooks/useFetch';
import { apiUserGet } from '@/app/api/user/get/_def';

type Props = {
    params: {
        id: Guid,
    }
}

export default function Page(props: Props) {

    const fetchUser = useFetch({
        fetch: () => apiUserGet.call({ id: props.params.id }),
    })

    if (fetchUser.loading) return (
        <div>Loading</div>
    );

    if (!fetchUser.data?.user) return (
        <div>Not found</div>
    );

    return (
        <main>

            {fetchUser.data?.user?.name}

        </main>
    )
}
