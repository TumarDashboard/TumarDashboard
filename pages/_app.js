import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { AnimatePresence } from "framer-motion";
import AppLayout from "../components/hight/AppLayout";
import FLoadingScreen from "../components/hight/LoadingScreen";
import { StoreProvider } from '../components/hight/StoreProvider';

export default function App({ Component, pageProps, router }) {

  const [isFirstMount, setIsFirstMount] = useState(true);

  useEffect(() => {

    const handleRouteChange = () => {
      isFirstMount && setIsFirstMount(false);
    };

    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };

  }, []);

  return (
    <StoreProvider
      {...pageProps}
    >

      <FLoadingScreen
        key="LoadingScreen"
      />

      <AppLayout
        key="Layout"
        onSidebar={Component.onSidebar}
      >
        <AnimatePresence exitBeforeEnter>
          <Component
            isFirstMount={isFirstMount}
            key={router.route}
            {...pageProps}
          />
        </AnimatePresence>
      </AppLayout>

    </StoreProvider>
  )

}