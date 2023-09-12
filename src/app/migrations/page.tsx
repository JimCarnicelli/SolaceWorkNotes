import { runMigrationScripts as runDbMigrations } from '@/lib/db/migrations/_allMigrations';

export default async function Page() {

    await runDbMigrations();

    return (
        <main>

            Database migrations applied

        </main>
    );
}
