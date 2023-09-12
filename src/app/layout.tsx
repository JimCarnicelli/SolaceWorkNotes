import './globals.scss'

type Props = {
    children: React.ReactNode,
}

export default function RootLayout(props: Props) {
    return (
        <html lang='en'>
            <body>{props.children}</body>
        </html>
    );
}
