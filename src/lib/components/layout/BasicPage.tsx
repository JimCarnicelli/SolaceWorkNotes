/* eslint-disable @next/next/no-img-element */
import './BasicPage.scss';
import { useGlobalState } from '@/lib/hooks/useGlobalState';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import { Button, ButtonOnClick } from '@/lib/components/action/Button';
import { Spinner } from '@/lib/components/action/Spinner';
import { MessageBox } from '@/lib/components/action/MessageBox';
import { TabBar, TabBarTab } from '@/lib/components/action/TabBar';
import { Toolbar } from '@/lib/components/action/Toolbar';
import { cn } from '@/lib/utilities/stringHelpers';
import { icons } from '../graphics/Icon';
import { TooltipHost } from '@/lib/hooks/useTooltip';

type Props = {
    notFound?: string,
    title?: string,
    hideTitle?: boolean,
    loading?: boolean,
    contained?: boolean,
    asManagement?: boolean,
    className?: string,
    itemTypeName?: string,  // eg 'product' or 'agency'
    manageViewUrl?: string,  // To toggle between manage and public views
    publicViewUrl?: string,  // To toggle between manage and public views
    goUpTitle?: ReactNode,
    onGoUp?: ButtonOnClick,
    toolbarButtons?: ReactNode,
    children: ReactNode,
    tabs?: TabBarTab[],
    currentTab?: string,
    fullWidth?: boolean,
    bleed?: boolean,
}

export function BasicPage(props: Props) {

    const gsApp = useGlobalState('App');
    const [showNav, setShowNav] = gsApp.useState<boolean>('ShowNav', false);
    const [pinNav, setPinNav] = gsApp.useState<boolean>('PinNav', false);

    const [peekNav, setPeekNav] = useState(false);

    const router = useRouter();

    useEffect(() => {
        let className = document.body.className
            .split(/ +/)
            .filter(e => e !== 'ManagementFlavor')
            .join(' ');
        if (props.asManagement) className += ' ManagementFlavor';
        document.body.className = className;
    }, [props.asManagement]);

    return (<>

        <div className={
            'BasicPage' +
            cn('DevMode', process.env.NEXT_PUBLIC_ENV !== 'production') +
            cn('FullWidth', props.fullWidth) +
            cn('Bleed', props.bleed) +
            cn('Contained', props.contained) +
            cn('PinnedNav', pinNav)
        }>

            <div className='PageHeader'>

            </div>

            <div className='MainLessNav'>

                {(!props.notFound && props.tabs)
                    ? (
                        <TabBar
                            tabs={props.tabs}
                            value={props.currentTab}
                            className='ForHeader'
                        />
                    )
                    : <></>
                }

                <div className='MainBlock'>
                    <div className='MainAndFooter'>

                        {!props.notFound && props.toolbarButtons && (
                            <Toolbar centered>
                                {props.toolbarButtons}
                            </Toolbar>
                        )}

                        {props.loading

                            ? (<main className='BasicPageContents Loading'>
                                <Spinner />
                            </main>)

                            : props.notFound

                                ? (<main className='BasicPageContents NotFound'>
                                    {<h1>404 - {props.notFound}</h1>}
                                </main>)

                                : (<main
                                    className={
                                        'BasicPageContents ' +
                                        (props.className ?? '')
                                    }
                                >
                                    {props.title && (
                                        <h1 className={cn('Invisible', props.hideTitle)}>
                                            {props.onGoUp && (
                                                <Button
                                                    tooltip={'Back to ' + props.goUpTitle}
                                                    icon={icons.FaChevronLeft}
                                                    onClick={props.onGoUp}
                                                />
                                            )}
                                            {props.title}
                                        </h1>
                                    )}
                                    {props.children}
                                </main>)

                        }
                    </div>

                </div>
            </div>

        </div>

        <MessageBox />
        <TooltipHost />

    </>);
}

/** A component living in page-space must have a default export. This is a useful stand-in. */
export function notAPage() {
    return function NotAPage() {
        return (
            <BasicPage
                notFound='Not a page'
                title='Not a page'
                hideTitle
            >
                &nbsp;
            </BasicPage>
        )
    };
}
