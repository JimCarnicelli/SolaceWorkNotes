'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
    warning?: string,
    //handler?: () => boolean,
    enabled?: boolean  // Defaults to true
}

export function useLeavingPage(props: Props) {
    const enabled = props.enabled === undefined ? true : !!props.enabled;

    const router = useRouter();

    useEffect(() => {
        const warning = props.warning ??
            `You have unsaved changes. Sure you want to leave?\n- Click 'OK' to leave\n- Click 'Cancel' to stay`;

        function handleWindowClose(ev: BeforeUnloadEvent) {
            if (!enabled) return;
            ev.preventDefault();
            return (ev.returnValue = warning);
        };
        window.addEventListener('beforeunload', handleWindowClose);

        //TODO: Clean this up
        /*
        function handleBrowseAway() {
            if (!enabled) return;
            if (window.confirm(warning)) return;
            router.events.emit('routeChangeError');
            throw 'User cancelled route change';
        };
        router.events.on('routeChangeStart', handleBrowseAway);
        */

        return () => {
            window.removeEventListener('beforeunload', handleWindowClose);
            //router.events.off('routeChangeStart', handleBrowseAway);
        };

    }, [enabled, props.warning /*, router.events */]);

}
