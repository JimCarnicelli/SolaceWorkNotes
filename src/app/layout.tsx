import '@/styles/globals.scss'
import { GlobalStateContextProvider } from '@/lib/hooks/useGlobalState';
import { Toaster } from 'react-hot-toast';

type Props = {
    children: React.ReactNode,
}

export default function RootLayout(props: Props) {
    return (
        <html lang='en'>
            <body>
                <GlobalStateContextProvider>
                    <div className='Toaster'><Toaster /></div>
                    {props.children}
                </GlobalStateContextProvider>
            </body>
        </html>
    );
}
