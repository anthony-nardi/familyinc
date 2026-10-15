import { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { createTheme, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AppStateProvider } from '@components/state/AppStateProvider';
import { SocketManagerProvider } from '@components/websocket/SocketManagerProvider';
import { pageView } from '@utils/analytics';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@styles/main.css';

const theme = createTheme({
  defaultRadius: 'xs',
  radius: {
    xs: '1px',
    sm: '1px',
    md: '1px',
    lg: '1px',
    xl: '1px',
  },
});

export default function App(props: AppProps) {
  const {Component, pageProps} = props;
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => pageView(url);

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => router.events.off('routeChangeComplete', handleRouteChange);
  }, [router.events]);

  return (
    <AppStateProvider>
      <Head>
        <title>Family Inc</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width"/>
        <meta name="description" content="Family Inc Game"/>
      </Head>

      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
      />

      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      <MantineProvider theme={theme} defaultColorScheme="dark">
        <Notifications position="top-right" limit={15} />
        <SocketManagerProvider>
          <Component {...pageProps} />
        </SocketManagerProvider>
      </MantineProvider>
    </AppStateProvider>
  );
}
