import { icons } from '@/lib/components/graphics/Icon';
import { BasicPage } from '@/lib/components/layout/BasicPage';
import { runMigrationScripts as runDbMigrations } from '@/lib/db/migrations/_allMigrations';

export default async function Page() {

    await runDbMigrations();

    return (<>
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '5rem' }}>
            <icons.FaCheckCircle/>&nbsp;Database migrations applied
        </h1>
        <p className='CenteredText'>
            Use the back button to return to the home page
        </p>
    </>);
}
