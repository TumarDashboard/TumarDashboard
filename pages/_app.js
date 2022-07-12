import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { AnimatePresence } from "framer-motion";
import AppLayout from "../components/hight/AppLayout";
import FLoadingScreen from "../components/hight/LoadingScreen";
import FGoogleAuthError from "../components/hight/GoogleAuthError";
import { StoreProvider } from '../components/hight/StoreProvider';
import LoadingScreenData from '../components/hight/LoadingScreenData';

export default function App({ Component, pageProps, router }) {

  const [isFirstMount, setIsFirstMount] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const handleRouteChange = () => {
      isFirstMount && setIsFirstMount(false);
      setIsLoading(false);
    };

    const handleRouteEnd = () => {
      isFirstMount && setIsFirstMount(false);
      setIsLoading(true);
    };

    router.events.on("routeChangeStart", handleRouteChange);
    router.events.on("routeChangeComplete", handleRouteEnd);
    router.events.on("routeChangeError", handleRouteEnd);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
      router.events.off("routeChangeComplete", handleRouteEnd);
      router.events.off("routeChangeError", handleRouteEnd);
    };

  }, []);

  return (
    <StoreProvider
      isFirstMount={isFirstMount}
      {...pageProps}
    >

      <FLoadingScreen
        key="LoadingScreen"
      />

      <FGoogleAuthError
        key="GoogleAuthError"
      />

      <AppLayout
        key="Layout"
        onSidebar={Component.onSidebar}
        isLoading={setIsLoading}
      >

        <AnimatePresence exitBeforeEnter>
          {isLoading ? 
          <Component
            isFirstMount={isFirstMount}
            key={router.route}
            {...pageProps}
          /> : 
          <LoadingScreenData/>}
        </AnimatePresence>
      </AppLayout>

    </StoreProvider>
  )

}