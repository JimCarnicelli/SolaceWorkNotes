import { doAThing } from '@/db/entities/User'
import styles from './page.module.scss'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Home page',
    description: 'Thingy here',
}

async function getStuff() {

    //await doAThing();
    
    const ret = {
        value: 'xyz',
    }
    return ret;
}

export default async function Home() {

    const stuff = await getStuff();

    return (
        <main className={styles.main}>

            {stuff.value}

        </main>
    )
}
