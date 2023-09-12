import { runMigrationScripts as runDbMigrations } from '@/db/dbMigrations';
import styles from './page.module.scss'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Home page',
    description: 'Thingy here',
}

async function getStuff() {

    //TODO: Find a better place for this to minimize redundate execution
    await runDbMigrations();

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
