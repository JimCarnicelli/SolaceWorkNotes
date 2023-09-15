'use client';
import { Button } from '@/lib/components/action/Button';
import { icons } from '@/lib/components/graphics/Icon';
import { BasicPage } from '@/lib/components/layout/BasicPage'
import { pageRoutes } from '@/lib/pageRoutes';
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Solace demo app',
}

type Props = {
}

export default function Page(props: Props) {

    return (
        <BasicPage
            title='Solace demo app'
            toolbarButtons={<>
                <Button
                    title='My clients'
                    icon={icons.FaUserAlt}
                    onClick={pageRoutes.clientList()}
                />
                <Button
                    title='Database migrations'
                    icon={icons.BsGearFill}
                    onClick={pageRoutes.migrations()}
                />
            </>}
            className='UnderlinedLinks'
        >

            <p>
                Started 9/11/2023 by <a href='https://jimcarnicelli.com/'>Jim Carnicelli</a> as
                an assignment from <a href='https://www.solace.health/'>Solace, Inc</a> as part
                of an application for the <i>Senior Full Stack Software Engineer</i> opening.
                See the <a href='https://github.com/JimCarnicelli/SolaceWorkNotes'>Github project</a> for
                work notes and the source code.
            </p>

            <p>
                If you just installed this project and are still setting it up, you&apos;ll need
                to <a href={pageRoutes.migrations()}>run the database migration scripts</a> to 
                construct the new schema and add some sample data to the blank database you 
                configured. Copy the .env file to .env.local and customize it to your dev environment.
            </p>

            <p>
                The main action is in the &quot;<a href={pageRoutes.clientList()}>My clients</a>&quot; page, which acts a bit like a dashboard.
            </p>

        </BasicPage>
    )
}
