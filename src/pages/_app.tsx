// import '@/styles/globals.css'
// import type { AppProps } from 'next/app'
// import 'antd/dist/reset.css'
// import Layout from '@/components/Layout'

// export default function App({ Component, pageProps }: AppProps) {
//   return <Layout> <Component {...pageProps} /> </Layout>;
// }

import React, { useState, useEffect } from 'react';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import 'antd/dist/reset.css';
import Layout from '@/components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function App({ Component, pageProps }: AppProps) {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  //  console.log({ router });
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (router.pathname === "/" || router.pathname === "/login") ? (
    <>
      <Head>
        <meta charSet="UTF-8" />
        < link rel="icon" type="image/png" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>敏捷看板</title>
      </Head >
      <Component {...pageProps} />
    </>
  ) : (
    <>
      <Head>
        <meta charSet="UTF-8" />
        < link rel="icon" type="image/png" href="/logo.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>敏捷看板</title>
      </Head >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
