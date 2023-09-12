import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Home page',
    description: 'Thingy here',
}

type Props = {
}

export default async function Page(props: Props) {

    return (
        <main>

            Home

        </main>
    )
}
