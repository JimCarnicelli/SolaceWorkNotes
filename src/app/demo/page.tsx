import TestComponent from '@/app/demo/TestComponent';
import styles from './page.module.scss'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Home page',
    description: 'Thingy here',
}

async function getStuff() {
    const ret = {
        value: 'xyz',
    }
    return ret;
}

type Props = {
    searchParams: {
        name: string,
    }
}

export default async function Page(props: Props) {

    const stuff = await getStuff();

    return (
        <main className={styles.main}>

            <p>{props.searchParams.name}</p>

            <p>{stuff.value}</p>

            <TestComponent/>

        </main>
    )
}
