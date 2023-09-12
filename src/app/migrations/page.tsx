import { runMigrationScripts as runDbMigrations } from '@/lib/db/dbMigrations';

export default async function Page() {

    await runDbMigrations();

    return (
        <main>

            Database migrations applied

        </main>
    );
}
